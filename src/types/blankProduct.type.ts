import { ImageDirection } from "@prisma/client";

export interface BlankProductMaterialInput {
  material: string;
}

export interface BlankProductImageInput {
  url: string;
  direction: ImageDirection;
}

export interface BlankProductColorInput {
  color: string;
  images: BlankProductImageInput[];
}

export interface CreateBlankProductInput {
  name: string;
  description?: string | null;
  price?: number | null;
  isActive?: boolean;

  materials: BlankProductMaterialInput[];
  colors: BlankProductColorInput[];
}

export interface UpdateBlankProductInput {
  name?: string;
  description?: string | null;
  price?: number | null;
  isActive?: boolean;

  materials?: BlankProductMaterialInput[];
  colors?: BlankProductColorInput[];
}