export interface RetailReviewCreateData {
  userId: number;
  retailProductId: number;
  rating: number;
  comment?: string;
}


export interface RetailReviewUpdateData {
  userId: number;
  rating?: number;
  comment?: string;
}