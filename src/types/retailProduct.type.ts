export interface RetailProductFilters {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: "latest" | "price_asc" | "price_desc";
  featured?: boolean;
  isActive?: boolean;
  page: number;
  limit: number;
}