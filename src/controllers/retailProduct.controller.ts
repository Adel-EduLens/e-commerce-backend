import { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { RetailProductService } from "../services/retailProduct.service.js";
import type { RetailProductFilters } from "../types/retailProduct.type.js";
const retailProductService = new RetailProductService();

export const getAllProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      sort,
      featured,
      isActive,
      page,
      limit,
    } = req.query;
    
    const filters: RetailProductFilters = {
      ...(search && { search: String(search) }),
      ...(categoryId && { categoryId: Number(categoryId) }),
      ...(minPrice && { minPrice: Number(minPrice) }),
      ...(maxPrice && { maxPrice: Number(maxPrice) }),
      ...(sort && { sort: sort as NonNullable<RetailProductFilters["sort"]> }),
      ...(featured !== undefined && { featured: featured === "true" }),
      isActive: isActive !== undefined ? isActive === "true" : true,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    };

    const result = await retailProductService.getAllProducts(filters);
    successResponse(res, {
      statusCode: 200,
      message: "Products fetched successfully",
      data: result,
    });
  },
);

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await retailProductService.getProductById(Number(id));
    successResponse(res, {
      statusCode: 200,
      message: "Product fetched successfully",
      data: product,
    });
  },
);

export const getProductBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params as { slug: string };
    const product = await retailProductService.getProductBySlug(slug);
    successResponse(res, {
      statusCode: 200,
      message: "Product fetched successfully",
      data: product,
    });
  },
);

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      discountPrice,
      stock,
      sku,
      brand,
      isFeatured,
      isActive,
      categoryId,
      images,
      colors,
      sizes,
      depositAmount,
      securityDeposit,
      termsAndConditions,
      privacyPolicy,
    } = req.body;

    const product = await retailProductService.createProduct({
      name,
      slug,
      description,
      shortDescription,
      price,
      discountPrice,
      stock,
      sku,
      brand,
      isFeatured,
      isActive,
      categoryId,
      images,
      colors,
      sizes,
      depositAmount,
      securityDeposit,
      termsAndConditions,
      privacyPolicy,
    });

    successResponse(res, {
      statusCode: 201,
      message: "Product created successfully",
      data: product,
    });
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      discountPrice,
      stock,
      sku,
      brand,
      isFeatured,
      isActive,
      categoryId,
      images,
      colors,
      sizes,
      depositAmount,
      securityDeposit,
      termsAndConditions,
      privacyPolicy,
    } = req.body;

    if (images || colors || sizes) {
      const product = await retailProductService.updateProductWithRelations(
        Number(id),
        {
          product: {
            name,
            slug,
            description,
            shortDescription,
            price,
            discountPrice,
            stock,
            sku,
            brand,
            isFeatured,
            isActive,
            categoryId,
            depositAmount,
            securityDeposit,
            termsAndConditions,
            privacyPolicy,
          },
          images,
          colors,
          sizes,
        },
      );
      return successResponse(res, {
        statusCode: 200,
        message: "Product updated successfully",
        data: product,
      });
    }

    const product = await retailProductService.updateProduct(Number(id), {
      name,
      slug,
      description,
      shortDescription,
      price,
      discountPrice,
      stock,
      sku,
      brand,
      isFeatured,
      isActive,
      categoryId,
      depositAmount,
      securityDeposit,
      termsAndConditions,
      privacyPolicy,
    });

    successResponse(res, {
      statusCode: 200,
      message: "Product updated successfully",
      data: product,
    });
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await retailProductService.deleteProduct(Number(id));
    successResponse(res, {
      statusCode: 200,
      message: "Product deleted successfully",
    });
  },
);
