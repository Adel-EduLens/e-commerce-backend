export interface ReviewCreateData {
  productId: string;
  userId: number;
  rating: number;
  comment?: string;
}

export interface ReviewUpdateData {
  userId: number;
  rating?: number;
  comment?: string;
}