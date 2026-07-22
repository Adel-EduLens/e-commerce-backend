import { Request, Response } from 'express';
import { asyncHandler } from '../utils/globalErrorHandler.util.js';
import { successResponse } from '../utils/response.util.js';
import prisma from '../utils/prismaClient.js';
import AppError from '../utils/AppError.util.js';

const INFLUENCER_COMMISSION_HOLD_DAYS = 15;

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized: Please log in to complete checkout', 401);
  }

  const userId = Number(req.user.id);
  const {
    firstName,
    lastName,
    phone,
    email,
    country,
    city,
    area,
    streetAddress,
    apartment,
    mapAddress,
    latitude,
    longitude,
    total,
    couponCode,
    paymentMethod,
    items,
  } = req.body;

  // Basic validation
  if (
    !firstName ||
    !lastName ||
    !phone ||
    !email ||
    !country ||
    !city ||
    !area ||
    !streetAddress ||
    !paymentMethod ||
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new AppError('Please fill in all required delivery details and add items to your cart', 400);
  }

  // Run database transaction to create order, its items, and update coupon usage
  const result = await prisma.$transaction(async (tx) => {
    interface ResolvedOrderItem {
      productId: string;
      title: string;
      price: number;
      quantity: number;
      size: string | null;
      color: string | null;
      imageSrc: string | null;
      categoryId: string | null;
      categoryIds?: string[];
    }
    const resolvedItems: ResolvedOrderItem[] = [];
    let calculatedSubtotal = 0;

    // 1. Resolve and calculate the real price for each item from the DB
    for (const item of items) {
      const pId = String(item.id || item.productId);
      const qty = parseInt(item.quantity || 1, 10);
      let dbPrice = 0;
      let dbTitle = '';
      let dbImageSrc = '';
      let dbCategoryId: string | null = null;
      let resolved = false;

      // Try Product (String CUID)
      const product = await tx.product.findUnique({
        where: { id: pId },
        include: { images: true, categories: true }
      });

      if (!product) {
        throw new AppError(`Product not found: ${pId}`, 404);
      }

      const hasFlashDeal = product.isFlashDeals &&
                           product.flashDealPrice &&
                           product.flashDealEndsAt &&
                           new Date(product.flashDealEndsAt) > new Date();

      dbPrice = (hasFlashDeal && product.flashDealPrice)
        ? product.flashDealPrice
        : (product.shopPrice ?? product.retailPrice ?? product.wholesalePrice ?? product.blankPrice ?? 0);
      dbTitle = product.name;
      const colorImage = product.images.find(
        img => img.color && img.color.toLowerCase() === (item.color || '').toLowerCase()
      );
      dbImageSrc = colorImage ? colorImage.url : (product.images?.[0]?.url || '');
      dbCategoryId = product.categories?.[0]?.id ? String(product.categories[0].id) : null;
      const dbCategoryIds = product.categories ? product.categories.map((c: any) => String(c.id)) : [];

      calculatedSubtotal += dbPrice * qty;

      resolvedItems.push({
        productId: pId,
        title: dbTitle,
        price: dbPrice,
        quantity: qty,
        size: item.size || null,
        color: item.color || null,
        imageSrc: dbImageSrc || null,
        categoryId: dbCategoryId,
        categoryIds: dbCategoryIds,
      });
    }

    // 2. If coupon code is used, validate it and record usage
    let calculatedDiscount = 0;
    let isInfluencerCoupon = false;
    let influencerCouponData: any = null;

    if (couponCode) {
      const trimmedCode = couponCode.trim().toUpperCase();

      // First check if it's an influencer coupon
      const influencerCoupon = await tx.influencerCoupon.findUnique({
        where: { code: trimmedCode },
        include: { influencer: { select: { id: true, status: true } } },
      });

      if (influencerCoupon) {
        isInfluencerCoupon = true;
        influencerCouponData = influencerCoupon;

        if (!influencerCoupon.isActive) {
          throw new AppError('This coupon is no longer active', 400);
        }
        if (influencerCoupon.influencer.status !== 'active') {
          throw new AppError('This coupon is no longer active', 400);
        }

        // Check one-time-per-user rule
        const existingUsage = await tx.influencerCouponUsage.findUnique({
          where: {
            couponId_userId: {
              couponId: influencerCoupon.id,
              userId: userId,
            },
          },
        });
        if (existingUsage) {
          throw new AppError('You have already used this coupon', 400);
        }

        // Influencer coupons apply to entire cart
        calculatedDiscount = (calculatedSubtotal * influencerCoupon.discountPercent) / 100;
      } else {
        // Fall through to trader coupon
        const coupon = await tx.coupon.findUnique({
          where: { code: trimmedCode },
        });

        if (coupon) {
          if (!coupon.isActive || coupon.validUntil < new Date()) {
            throw new AppError('Used coupon is invalid or has expired', 400);
          }
          if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            throw new AppError('Used coupon usage limit has been reached', 400);
          }

          // Calculate discount amount based on qualifying items
          let qualifyingSubtotal = 0;
          let hasMatchingItem = false;

          for (const orderItem of resolvedItems) {
            let applies = false;
            if (!coupon.categoryId && !coupon.productId) {
              applies = true;
            } else if (coupon.productId && String(orderItem.productId) === String(coupon.productId)) {
              applies = true;
            } else if (
              coupon.categoryId &&
              (String(orderItem.categoryId) === String(coupon.categoryId) ||
                (orderItem.categoryIds && orderItem.categoryIds.some((id: any) => String(id) === String(coupon.categoryId))))
            ) {
              applies = true;
            }

            if (applies) {
              qualifyingSubtotal += orderItem.price * orderItem.quantity;
              hasMatchingItem = true;
            }
          }

          if (hasMatchingItem) {
            calculatedDiscount = (qualifyingSubtotal * coupon.discount) / 100;
          }

          // Increment usedCount
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });

          // Create CouponUsage record
          await tx.couponUsage.create({
            data: {
              couponId: coupon.id,
              userId: userId,
            },
          });
        }
      }
    }

    const calculatedShipping = 50; // flat rate matching front-end
    const calculatedTotal = Math.max(0, calculatedSubtotal - calculatedDiscount + calculatedShipping);

    // Validate client-provided values to prevent total tampering (with safe float epsilon check)
    if (Math.abs(calculatedTotal - parseFloat(total)) > 1.0) {
      throw new AppError('Order total manipulation detected or calculation mismatch', 400);
    }

    // 3. Create the Order
    const order = await tx.order.create({
      data: {
        userId,
        firstName,
        lastName,
        phone,
        email,
        country,
        city,
        area,
        streetAddress,
        apartment,
        mapAddress: mapAddress || null,
        latitude: latitude ? String(latitude) : null,
        longitude: longitude ? String(longitude) : null,
        subtotal: calculatedSubtotal,
        discount: calculatedDiscount,
        shipping: calculatedShipping,
        total: calculatedTotal,
        couponCode: couponCode || null,
        paymentMethod: paymentMethod.toUpperCase(),
        status: 'PENDING',
      },
    });

    // 4. Create the OrderItems
    const orderItemsData = resolvedItems.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      imageSrc: item.imageSrc,
    }));

    await tx.orderItem.createMany({
      data: orderItemsData,
    });

    // 5. Decrement product stock levels
    for (const item of items) {
      const pId = String(item.id || item.productId);
      const qty = parseInt(item.quantity || 1, 10);

      const product = await tx.product.findUnique({
        where: { id: pId },
      });
      if (product) {
        // Decrement global stock
        await tx.product.update({
          where: { id: pId },
          data: { stock: Math.max(0, (product.stock || 0) - qty) },
        });

        // Decrement size-specific variant stock if applicable
        if (item.size) {
          const sizeRecord = await tx.productSize.findFirst({
            where: {
              productId: pId,
              size: item.size,
              color: item.color || null,
            }
          });
          if (sizeRecord) {
            await tx.productSize.update({
              where: { id: sizeRecord.id },
              data: { quantity: Math.max(0, (sizeRecord.quantity || 0) - qty) },
            });
          }
        }

        // Decrement color stock if applicable
        if (item.color) {
          const colorRecord = await tx.productColor.findFirst({
            where: {
              productId: pId,
              color: { equals: item.color },
            }
          });
          if (colorRecord) {
            await tx.productColor.update({
              where: { id: colorRecord.id },
              data: { stock: Math.max(0, colorRecord.stock - qty) },
            });
          }
        }
      }
    }

    // 6. If influencer coupon was used, record usage now.
    // The actual commission is created only when the order is completed.
    if (isInfluencerCoupon && influencerCouponData) {
      const commissionAmt = calculatedTotal * (influencerCouponData.commissionPercent / 100);

      await tx.influencerCouponUsage.create({
        data: {
          couponId: influencerCouponData.id,
          userId: userId,
          orderId: order.id,
          orderTotal: calculatedTotal,
          discountAmount: calculatedDiscount,
          commissionAmount: commissionAmt,
        },
      });
    }

    // Return the created order with its items included
    return tx.order.findUnique({
      where: { id: order.id },
      include: {
        items: true,
      },
    });
  });

  successResponse(res, {
    message: 'Order created successfully',
    data: result,
    statusCode: 201,
  });
});

export const getUserOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized: Please log in to view your orders', 401);
  }

  const userId = Number(req.user.id);

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  successResponse(res, {
    message: 'Orders fetched successfully',
    data: orders,
  });
});

export const getTraderOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'trader') {
    throw new AppError('Unauthorized: Trader access only', 401);
  }

  const traderId = Number(req.user.id);

  // 1. Get all product IDs for this trader
  const traderProducts = await prisma.product.findMany({
    where: { traderId },
    select: { id: true },
  });


  const traderProductIds = traderProducts.map((p) => p.id);

  // 2. Get all orders containing any of those product IDs
  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          productId: { in: traderProductIds },
        },
      },
    },
    include: {
      items: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 3. Format and filter items for the trader view
  const formattedOrders = orders.map((order) => {
    const traderItems = order.items.filter((item) => traderProductIds.includes(item.productId));
    const traderSubtotal = traderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      id: order.id,
      orderId: `#${order.id.slice(-8).toUpperCase()}`,
      customer: `${order.firstName} ${order.lastName}`,
      customerEmail: order.email,
      customerPhone: order.phone,
      address: `${order.apartment ? `Apt ${order.apartment}, ` : ''}${order.streetAddress}, ${order.area}, ${order.city}, ${order.country}`,
      mapAddress: order.mapAddress,
      latitude: order.latitude,
      longitude: order.longitude,
      date: new Date(order.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      time: new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      payment: order.paymentMethod === "COD" ? "Cash" : "Card",
      total: `EGP ${order.total.toFixed(2)}`,
      subtotal: `EGP ${traderSubtotal.toFixed(2)}`,
      shipping: `EGP ${order.shipping.toFixed(2)}`,
      discount: `EGP ${order.discount.toFixed(2)}`,
      status: order.status,
      items: traderItems.map((item) => ({
        id: item.productId,
        productId: item.productId,
        product: item.title,
        quantity: item.quantity,
        price: `EGP ${item.price.toFixed(2)}`,
        subtotal: `EGP ${(item.price * item.quantity).toFixed(2)}`,
        size: item.size,
        color: item.color,
        image: item.imageSrc || "",
      })),
    };
  });

  successResponse(res, {
    message: 'Trader orders fetched successfully',
    data: formattedOrders,
  });
});

export const updateTraderOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'trader') {
    throw new AppError('Unauthorized: Trader access only', 401);
  }

  const id = String(req.params.id);
  const { status } = req.body;

  if (!status) {
    throw new AppError('Please provide a status update', 400);
  }

  const allowedStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
  if (!allowedStatuses.includes(status.toUpperCase())) {
    throw new AppError('Invalid order status. Allowed values: PENDING, PROCESSING, SHIPPED, COMPLETED, CANCELLED', 400);
  }

  const traderId = Number(req.user.id);

  // 1. Get all product IDs for this trader
  const traderProducts = await prisma.product.findMany({
    where: { traderId },
    select: { id: true },
  });

  const traderProductIds = traderProducts.map((p) => p.id);

  // 2. Find the order and verify it contains this trader's products
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const ownsProduct = order.items.some((item) => traderProductIds.includes(item.productId));
  if (!ownsProduct) {
    throw new AppError('Unauthorized: You do not own any products in this order', 403);
  }

  const nextStatus = status.toUpperCase();

  // 3. Update the order status and sync influencer commission lifecycle
  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id },
      data: { status: nextStatus },
    });

    const influencerUsage = await tx.influencerCouponUsage.findUnique({
      where: { orderId: id },
      include: {
        coupon: {
          select: {
            influencerId: true,
            commissionPercent: true,
          },
        },
      },
    });

    if (!influencerUsage) {
      return updated;
    }

    if (nextStatus === 'COMPLETED') {
      const existingCommission = await tx.influencerCommission.findFirst({
        where: { orderId: id },
      });

      const eligibleAt = new Date();
      eligibleAt.setDate(eligibleAt.getDate() + INFLUENCER_COMMISSION_HOLD_DAYS);

      if (!existingCommission) {
        await tx.influencerCommission.create({
          data: {
            influencerId: influencerUsage.coupon.influencerId,
            orderId: id,
            orderTotal: influencerUsage.orderTotal,
            commissionPercent: influencerUsage.coupon.commissionPercent,
            commissionAmount: influencerUsage.commissionAmount,
            eligibleAt,
          },
        });
      } else if (order.status !== 'COMPLETED' && existingCommission.status !== 'SETTLED') {
        await tx.influencerCommission.update({
          where: { id: existingCommission.id },
          data: {
            influencerId: influencerUsage.coupon.influencerId,
            orderTotal: influencerUsage.orderTotal,
            commissionPercent: influencerUsage.coupon.commissionPercent,
            commissionAmount: influencerUsage.commissionAmount,
            eligibleAt,
            status: 'PENDING',
            settlementId: null,
          },
        });
      }
    }

    if (nextStatus === 'CANCELLED') {
      await tx.influencerCommission.updateMany({
        where: {
          orderId: id,
          status: { in: ['PENDING', 'ELIGIBLE'] },
        },
        data: {
          status: 'CANCELLED',
          settlementId: null,
        },
      });
    }

    return updated;
  });

  successResponse(res, {
    message: 'Order status updated successfully',
    data: updatedOrder,
  });
});
