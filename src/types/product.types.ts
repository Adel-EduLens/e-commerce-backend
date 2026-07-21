import { ProductType, ImageDirection } from "@prisma/client";

// ============ Sub-type Inputs ============

export type ProductImageInput = {
  url: string;
  color?: string | null;
  direction?: ImageDirection | null;
  colorId?: string | null;
};

export type ProductSizeInput =
  | string
  | {
      size: string;
      quantity?: number;
      color?: string | null;
      productColorId?: string | null;
    };

export type ProductColorInput = {
  color: string;
  // WHOLESALE-specific
  minOrder?: number;
  stock?: number;
  sizes?: { size: string }[];
};

export type ProductMaterialInput = {
  material: string;
};

// ============ Create ============

export interface ProductCreateData {
  productTypes: ProductType[]; // e.g. ['SHOP', 'WHOLESALE']
  name: string;
  description?: string | null;
  sku: string; // required & unique

  // --- Pricing ---
  shopPrice?: number | null;
  retailPrice?: number | null;
  wholesalePrice?: number | null;
  blankPrice?: number | null;

  // --- SHOP ---
  sizeguide?: string | null;
  isMustHave?: boolean;
  isFlashDeals?: boolean;
  flashDealPrice?: number | null;
  flashDealEndsAt?: string | Date | null;

  // --- RETAIL ---
  depositAmount?: number | null;
  securityDeposit?: number | null;
  termsAndConditions?: string | null;
  privacyPolicy?: string | null;
  isFeatured?: boolean;

  // --- WHOLESALE ---
  minOrder?: number;
  isBestDeal?: boolean;
  isMostPopular?: boolean;
  isPremiumCollection?: boolean;

  // --- BLANK ---
  isActive?: boolean;
  materials?: ProductMaterialInput[];

  // --- Shared ---
  stock?: number;
  rating?: number;
  traderId: number;
  categoryIds: string[];
  brandId?: string | null;
  images?: ProductImageInput[];
  sizes?: ProductSizeInput[];
  colors?: ProductColorInput[];
}

// ============ Update ============

export interface ProductUpdateData {
  productTypes?: ProductType[];
  name?: string;
  description?: string | null;
  sku?: string | null;

  // --- Pricing ---
  shopPrice?: number | null;
  retailPrice?: number | null;
  wholesalePrice?: number | null;
  blankPrice?: number | null;

  // --- SHOP ---
  sizeguide?: string | null;
  isMustHave?: boolean;
  isFlashDeals?: boolean;
  flashDealPrice?: number | null;
  flashDealEndsAt?: string | Date | null;

  // --- RETAIL ---
  depositAmount?: number | null;
  securityDeposit?: number | null;
  termsAndConditions?: string | null;
  privacyPolicy?: string | null;
  isFeatured?: boolean;

  // --- WHOLESALE ---
  minOrder?: number;
  isBestDeal?: boolean;
  isMostPopular?: boolean;
  isPremiumCollection?: boolean;

  // --- BLANK ---
  isActive?: boolean;
  materials?: ProductMaterialInput[];

  // --- Shared ---
  stock?: number;
  rating?: number;
  traderId: number;
  categoryIds?: string[];
  brandId?: string | null;
  images?: ProductImageInput[];
  sizes?: ProductSizeInput[];
  colors?: ProductColorInput[];
}

// ============ Query ============

export type GetProductsQuery = {
  // Type filter
  type?: ProductType | undefined;

  // Search
  search?: string | undefined;

  // Filters
  categoryId?: string | undefined;
  brandId?: string | undefined;
  traderId?: number | undefined;

  // SHOP filters
  filter?: string | undefined; // 'must-have' | 'flash-deals'

  // WHOLESALE filters
  isBestDeal?: boolean | undefined;
  isMostPopular?: boolean | undefined;
  isPremiumCollection?: boolean | undefined;

  // RETAIL filters
  isFeatured?: boolean | undefined;

  // Shared filters
  size?: string | undefined;
  color?: string | undefined;
  priceMin?: number | undefined;
  priceMax?: number | undefined;
  rating?: number | undefined;
  stock?: "in_stock" | "out_of_stock" | undefined;

  // Sorting
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;

  // Pagination
  page?: number | undefined;
  limit?: number | undefined;

  // Collection filter (SHOP)
  collectionId?: string | undefined;
};
