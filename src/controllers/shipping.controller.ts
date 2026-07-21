import type { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { shippingService } from "../services/shipping.service.js";

// --- Shipping Country Controllers ---

export const createCountry = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await shippingService.createCountry(req.body);
    successResponse(res, {
      statusCode: 201,
      message: "Shipping country created successfully",
      data: result,
    });
  }
);

export const getCountries = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await shippingService.getAllCountries();
    successResponse(res, {
      message: "Shipping countries fetched successfully",
      data: result,
    });
  }
);

export const getCountryById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await shippingService.getCountryById(id);
    successResponse(res, {
      message: "Shipping country fetched successfully",
      data: result,
    });
  }
);

export const updateCountry = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await shippingService.updateCountry(id, req.body);
    successResponse(res, {
      message: "Shipping country updated successfully",
      data: result,
    });
  }
);

export const deleteCountry = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await shippingService.deleteCountry(id);
    successResponse(res, {
      message: "Shipping country deleted successfully",
    });
  }
);

// --- Shipping City Controllers ---

export const createCity = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await shippingService.createCity(req.body);
    successResponse(res, {
      statusCode: 201,
      message: "Shipping city created successfully",
      data: result,
    });
  }
);

export const getCities = asyncHandler(
  async (req: Request, res: Response) => {
    const countryId = req.query.countryId ? String(req.query.countryId) : undefined;
    const result = await shippingService.getAllCities(countryId);
    successResponse(res, {
      message: "Shipping cities fetched successfully",
      data: result,
    });
  }
);

export const getCityById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await shippingService.getCityById(id);
    successResponse(res, {
      message: "Shipping city fetched successfully",
      data: result,
    });
  }
);

export const updateCity = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await shippingService.updateCity(id, req.body);
    successResponse(res, {
      message: "Shipping city updated successfully",
      data: result,
    });
  }
);

export const deleteCity = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await shippingService.deleteCity(id);
    successResponse(res, {
      message: "Shipping city deleted successfully",
    });
  }
);
