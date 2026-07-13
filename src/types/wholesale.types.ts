export interface WholesaleColorInput {
  color: string;
  minOrder: number;
  stock: number;
  sizes: { size: string }[];
}

export interface WholesaleCreateData {
  name: string;
  description: string;
  price: number;
  minOrder: number;
  isBestDeal: boolean;
  isMostPopular: boolean;
  isPremiumCollection: boolean;
  brand: string;
  rating: number;
  categoryId: string;
  images: { url: string; color?: string }[];
  traderId: number;
  sku?: string;
  stock?: number;
  colors?: WholesaleColorInput[];
  sizes?: string[];
}

export interface WholesaleUpdateData {
  name?: string;
  description?: string;
  price?: number;
  minOrder?: number;
  isBestDeal?: boolean;
  isMostPopular?: boolean;
  isPremiumCollection?: boolean;
  brand?: string;
  rating?: number;
  categoryId?: string;
  images?: { url: string; color?: string }[];
  traderId: number;
  sku?: string | null;
  stock?: number;
  colors?: WholesaleColorInput[];
  sizes?: string[];
}
