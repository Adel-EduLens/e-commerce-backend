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
