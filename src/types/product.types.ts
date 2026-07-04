export interface ProductCreateData {
  name: string;
  description: string;
  price: number;
  brand: string;
  rating: number;
  categoryId: string;
  images: string[];
  sizes: string[];
  colors: string[];
  traderId:number;
}

export interface ProductUpdateData {
  name?: string;
  description?: string;
  price?: number;
  brand?: string;
  rating?: number;
  categoryId?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  traderId:number;
}