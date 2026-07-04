export interface ProductCreateData {
  name: string;
  description: string;
  price: number;
  brand: string;
  rating: number;
  reviews: string;
  categoryId: string;
  images: string[];
  sizes: string[];
  colors: string[];
}

export interface ProductUpdateData {
  name?: string;
  description?: string;
  price?: number;
  brand?: string;
  rating?: number;
  reviews?: string;
  categoryId?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
}