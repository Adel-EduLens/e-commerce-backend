export interface ProductCreateData {
  name: string;
  description: string;
  price: number;
  brandId?: string;
  rating: number;
  categoryId: string;
  images: ProductImageInput[];
  sizeguide?: string;
  sizes: (string | { size: string; quantity: number; color?: string })[];
  colors: string[];
  traderId: number;
  isMustHave?: boolean;
  isFlashDeals?: boolean;
  flashDealPrice?: number;
  flashDealEndsAt?: string | Date;
  sku?: string;
  stock?: number;
}
export type ProductImageInput = {
  url: string;
  color: string;
};

export interface ProductUpdateData {
  name?: string;
  description?: string;
  price?: number;
  brandId?: string;
  rating?: number;
  categoryId?: string;
  sizeguide?: string;
  images?: ProductImageInput[];
  sizes?: (string | { size: string; quantity: number; color?: string })[];
  colors?: string[];
  traderId: number;
  isMustHave?: boolean;
  isFlashDeals?: boolean;
  flashDealPrice?: number | null;
  flashDealEndsAt?: string | Date | null;
  sku?: string | null;
  stock?: number;
}

export type GetProductsQuery = {
  search?: string | undefined;
  categoryId?: string | undefined;
  brandId?: string | undefined;
  traderId?: number | undefined;
  filter?: string;
  size?: string;
  color?: string;
  priceMin?: number | undefined;
  priceMax?: number | undefined;

  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;

  page?: number | undefined;
  limit?: number | undefined;
};
export type ProductSizeInput =
  | string
  | {
      size: string;
      quantity: number;
      color?: string;
    };
