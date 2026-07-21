/**
 * Product System Data Migration Script
 *
 * This script migrates existing data from the old separate models
 * (RetailProduct, Wholesale, BlankProduct) into the unified Product model
 * BEFORE running the destructive schema migration.
 *
 * Run this BEFORE: npx prisma migrate dev --name unify_product_model
 *
 * Usage:
 *   npx ts-node prisma/migrations/migrate_products.ts
 *   or:
 *   npx tsx prisma/migrations/migrate_products.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting product data migration...\n");

  // ────────────────────────────────────────────────────────────────────────────
  // 1. Migrate RetailBrand → Brand (deduplicated by name)
  // ────────────────────────────────────────────────────────────────────────────
  console.log("📦 Step 1: Migrating RetailBrand → Brand...");

  const retailBrands = await (prisma as any).retailBrand.findMany();
  const retailBrandIdMap = new Map<string, string>(); // old retailBrandId → new/existing brandId

  for (const rb of retailBrands) {
    // Check if brand with same name already exists
    let existing = await (prisma as any).brand.findFirst({
      where: { name: rb.name },
    });

    if (!existing) {
      existing = await (prisma as any).brand.create({
        data: { name: rb.name },
      });
      console.log(`  ✓ Created Brand: "${rb.name}"`);
    } else {
      console.log(`  ~ Reusing existing Brand: "${rb.name}"`);
    }

    retailBrandIdMap.set(rb.id, existing.id);
  }

  console.log(`  Done. ${retailBrands.length} retail brands processed.\n`);

  // ────────────────────────────────────────────────────────────────────────────
  // 2. Migrate RetailProduct → Product (type: RETAIL)
  // ────────────────────────────────────────────────────────────────────────────
  console.log("📦 Step 2: Migrating RetailProduct → Product [RETAIL]...");

  const retailProducts = await (prisma as any).retailProduct.findMany({
    include: {
      images: true,
      colors: true,
      sizes: true,
    },
  });

  const retailProductIdMap = new Map<number, string>(); // old Int id → new cuid String id

  for (const rp of retailProducts) {
    // Validate: ensure category exists in unified categories table
    const categoryExists = await (prisma as any).category.findFirst({
      where: { id: rp.categoryId },
    });

    if (!categoryExists) {
      console.warn(
        `  ⚠ Skipping RetailProduct ${rp.id} — category ${rp.categoryId} not found`
      );
      continue;
    }

    const newBrandId = rp.brandId
      ? retailBrandIdMap.get(rp.brandId) ?? null
      : null;

    const product = await (prisma as any).product.create({
      data: {
        name: rp.name,
        description: rp.description ?? null,
        sku: rp.sku ?? `RETAIL-MIGRATED-${rp.id}-${Date.now()}`,
        stock: rp.stock ?? 0,
        rating: rp.rating ?? 0,

        // RETAIL pricing
        retailPrice: rp.price,

        // RETAIL-specific fields
        depositAmount: rp.depositAmount,
        securityDeposit: rp.securityDeposit,
        termsAndConditions: rp.termsAndConditions ?? null,
        privacyPolicy: rp.privacyPolicy ?? null,
        isFeatured: rp.isFeatured ?? false,

        traderId: rp.traderId,
        categoryId: rp.categoryId,
        ...(newBrandId && { brandId: newBrandId }),

        // Join table
        productTypes: {
          create: [{ type: "RETAIL" }],
        },

        // Images
        images: {
          create: rp.images.map((img: any) => ({
            url: img.url,
            color: img.color ?? null,
          })),
        },

        // Colors
        colors: {
          create: rp.colors.map((col: any) => ({
            color: col.color,
          })),
        },

        // Sizes
        sizes: {
          create: rp.sizes.map((sz: any) => ({
            size: sz.size,
            quantity: sz.quantity ?? 0,
            color: sz.color ?? null,
          })),
        },
      },
    });

    retailProductIdMap.set(rp.id, product.id);
    console.log(`  ✓ Migrated RetailProduct #${rp.id} → Product ${product.id}`);
  }

  console.log(`  Done. ${retailProducts.length} retail products migrated.\n`);

  // ────────────────────────────────────────────────────────────────────────────
  // 3. Update RetailOrders to point to new Product ids
  // ────────────────────────────────────────────────────────────────────────────
  console.log("📦 Step 3: Updating RetailOrder.productId references...");

  const retailOrders = await (prisma as any).retailOrder.findMany();
  let updatedOrders = 0;

  for (const ro of retailOrders) {
    const newProductId = retailProductIdMap.get(ro.productId);
    if (newProductId) {
      await (prisma as any).retailOrder.update({
        where: { id: ro.id },
        data: { productId: newProductId },
      });
      updatedOrders++;
    } else {
      console.warn(
        `  ⚠ RetailOrder ${ro.id} references missing RetailProduct ${ro.productId}`
      );
    }
  }

  console.log(`  Done. ${updatedOrders}/${retailOrders.length} retail orders updated.\n`);

  // ────────────────────────────────────────────────────────────────────────────
  // 4. Migrate Wholesale → Product (type: WHOLESALE)
  // ────────────────────────────────────────────────────────────────────────────
  console.log("📦 Step 4: Migrating Wholesale → Product [WHOLESALE]...");

  const wholesales = await (prisma as any).wholesale.findMany({
    include: {
      images: true,
      wholesaleColors: {
        include: { sizes: true },
      },
    },
  });

  for (const ws of wholesales) {
    const categoryExists = await (prisma as any).category.findFirst({
      where: { id: ws.categoryId },
    });

    if (!categoryExists) {
      console.warn(
        `  ⚠ Skipping Wholesale ${ws.id} — category ${ws.categoryId} not found`
      );
      continue;
    }

    // Resolve wholesale brand (was a plain string) — find or create Brand
    let wholesaleBrandId: string | null = null;
    if (ws.brand && typeof ws.brand === "string" && ws.brand.trim()) {
      let brandRecord = await (prisma as any).brand.findFirst({
        where: { name: ws.brand.trim() },
      });
      if (!brandRecord) {
        brandRecord = await (prisma as any).brand.create({
          data: { name: ws.brand.trim() },
        });
      }
      wholesaleBrandId = brandRecord.id;
    }

    const product = await (prisma as any).product.create({
      data: {
        name: ws.name,
        description: ws.description ?? null,
        sku: ws.sku ?? `WHOLESALE-MIGRATED-${ws.id}-${Date.now()}`,
        stock: ws.stock ?? 0,
        rating: ws.rating ?? 0,

        // WHOLESALE pricing
        wholesalePrice: ws.price,

        // WHOLESALE-specific
        minOrder: ws.minOrder ?? 1,
        isBestDeal: ws.isBestDeal ?? false,
        isMostPopular: ws.isMostPopular ?? false,
        isPremiumCollection: ws.isPremiumCollection ?? false,

        traderId: ws.traderId,
        categoryId: ws.categoryId,
        ...(wholesaleBrandId && { brandId: wholesaleBrandId }),

        // Join table
        productTypes: {
          create: [{ type: "WHOLESALE" }],
        },

        // Images
        images: {
          create: ws.images.map((img: any) => ({
            url: img.url,
            color: img.color ?? null,
          })),
        },
      },
    });

    // Create colors with nested sizes
    for (const col of ws.wholesaleColors) {
      await (prisma as any).productColor.create({
        data: {
          color: col.color,
          minOrder: col.minOrder ?? 1,
          stock: col.stock ?? 0,
          productId: product.id,
          sizes: {
            create: col.sizes.map((sz: any) => ({
              size: sz.size,
              quantity: 0,
              productId: product.id,
            })),
          },
        },
      });
    }

    console.log(`  ✓ Migrated Wholesale ${ws.id} → Product ${product.id}`);
  }

  console.log(`  Done. ${wholesales.length} wholesale products migrated.\n`);

  // ────────────────────────────────────────────────────────────────────────────
  // 5. Migrate BlankProduct → Product (type: BLANK)
  // ────────────────────────────────────────────────────────────────────────────
  console.log("📦 Step 5: Migrating BlankProduct → Product [BLANK]...");

  const blankProducts = await (prisma as any).blankProduct.findMany({
    include: {
      materials: true,
      colors: {
        include: { images: true },
      },
    },
  });

  // BlankProducts have no traderId — use the first available trader as default
  const defaultTrader = await (prisma as any).trader.findFirst();
  if (!defaultTrader) {
    console.warn(
      "  ⚠ No trader found. BlankProducts will be skipped if no trader exists."
    );
  }

  // BlankProducts also have no category — use the first available category as default
  const defaultCategory = await (prisma as any).category.findFirst();
  if (!defaultCategory) {
    console.warn(
      "  ⚠ No category found. BlankProducts will be skipped if no category exists."
    );
  }

  for (const bp of blankProducts) {
    if (!defaultTrader || !defaultCategory) {
      console.warn(
        `  ⚠ Skipping BlankProduct ${bp.id} — no default trader/category available`
      );
      continue;
    }

    const product = await (prisma as any).product.create({
      data: {
        name: bp.name,
        description: bp.description ?? null,
        sku: `BLANK-MIGRATED-${bp.id}-${Date.now()}`,
        stock: 0,
        rating: 0,

        // BLANK pricing
        blankPrice: bp.price ?? null,

        // BLANK-specific
        isActive: bp.isActive ?? true,

        traderId: defaultTrader.id,
        categoryId: defaultCategory.id,

        // Join table
        productTypes: {
          create: [{ type: "BLANK" }],
        },

        // Materials
        materials: {
          create: bp.materials.map((m: any) => ({ material: m.material })),
        },
      },
    });

    // Create colors with their images (direction-aware)
    for (const col of bp.colors) {
      const color = await (prisma as any).productColor.create({
        data: {
          color: col.color,
          productId: product.id,
        },
      });

      // Create images linked to this color's id with direction
      for (const img of col.images) {
        await (prisma as any).productImage.create({
          data: {
            url: img.url,
            direction: img.direction,
            colorId: color.id,
            productId: product.id,
          },
        });
      }
    }

    console.log(`  ✓ Migrated BlankProduct ${bp.id} → Product ${product.id}`);
  }

  console.log(`  Done. ${blankProducts.length} blank products migrated.\n`);

  // ────────────────────────────────────────────────────────────────────────────
  // 6. Migrate RetailProductReview → Review
  // ────────────────────────────────────────────────────────────────────────────
  console.log("📦 Step 6: Migrating RetailProductReview → Review...");

  const retailReviews = await (prisma as any).retailProductReview.findMany();
  let migratedReviews = 0;

  for (const rr of retailReviews) {
    const newProductId = retailProductIdMap.get(rr.retailProductId);
    if (!newProductId) {
      console.warn(
        `  ⚠ Skipping review ${rr.id} — RetailProduct ${rr.retailProductId} not migrated`
      );
      continue;
    }

    // Check if review already exists (avoid duplicate from unique constraint)
    const existing = await (prisma as any).review.findFirst({
      where: { userId: rr.userId, productId: newProductId },
    });

    if (existing) {
      console.warn(
        `  ~ Skipping review ${rr.id} — user ${rr.userId} already reviewed product ${newProductId}`
      );
      continue;
    }

    await (prisma as any).review.create({
      data: {
        rating: rr.rating,
        comment: rr.comment ?? null,
        userId: rr.userId,
        productId: newProductId,
        createdAt: rr.createdAt,
        updatedAt: rr.updatedAt,
      },
    });

    migratedReviews++;
  }

  console.log(
    `  Done. ${migratedReviews}/${retailReviews.length} retail reviews migrated.\n`
  );

  console.log("✅ Migration complete!\n");
  console.log(
    "Next step: Run `npx prisma migrate dev --name unify_product_model` to apply the schema changes.\n"
  );
  console.log(
    "⚠  After migration, old tables (RetailProduct, Wholesale, BlankProduct, etc.) will be dropped.\n"
  );
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
