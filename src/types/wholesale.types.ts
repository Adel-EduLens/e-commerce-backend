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
  sizes: string[];
  colors: string[];
  traderId: number;
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
  images?: string[];
  sizes?: string[];
  colors?: string[];
  traderId: number;
}
