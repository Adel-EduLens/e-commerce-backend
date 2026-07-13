export interface CreateBlankProductInput {
  name: string;
  description?: string | null;
  material: string;
  pattern: string;
  price?: number | null;
  isActive?: boolean;
  colors: {
    color: string;
  }[];
  images: {
    url: string;
    color: string;
  }[];
}

export interface UpdateBlankProductInput {
  name?: string;
  description?: string | null;
  material?: string;
  pattern?: string;
  price?: number | null;
  isActive?: boolean;
  colors?: {
    color: string;
  }[];
  images?: {
    url: string;
    color: string;
  }[];
}