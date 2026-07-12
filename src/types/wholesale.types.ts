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
  colors?: string[];
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
  colors?: string[];
  sizes?: string[];
}
