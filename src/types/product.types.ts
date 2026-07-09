export interface ProductColorInput {
  colorName: string;
  colorCode?: string;
  images: { imageUrl: string; isPrimary?: boolean }[];
  variants: { size: string; quantity: number; sku?: string }[];
}

export interface TraderProductCreateData {
  name: string;
  description?: string;
  price: number;
  brandId?: string;
  categoryId: string;
  traderId: number;
  sizeguide?: string;
  isMustHave?: boolean;
  isFlashDeals?: boolean;
  flashDealPrice?: number;
  flashDealEndsAt?: string | Date;
  sku?: string;
  stock?: number;
  colors: ProductColorInput[];
}

export interface ProductCreateData {
  name: string;
  description: string;
  price: number;
  brandId?: string;
  rating: number;
  categoryId: string;
  images: ProductImageInput[];
  sizeguide?: string;
  sizes: string[];
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
  sizes?: string[];
  colors?: string[];
  traderId: number;
  isMustHave?: boolean;
  isFlashDeals?: boolean;
  flashDealPrice?: number | null;
  flashDealEndsAt?: string | Date | null;
  sku?: string | null;
  stock?: number;
}

