export interface RetailProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "latest" | "price_asc" | "price_desc";
  featured?: boolean;
  isActive?: boolean;
  page: number;
  limit: number;
}
