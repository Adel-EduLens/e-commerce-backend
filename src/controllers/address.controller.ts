import { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { addressService } from "../services/address.service.js";

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const result = await addressService.addAddress(
    Number(req.user!.id),
    req.body,
  );

  successResponse(res, {
    statusCode: 201,
    message: "Address added successfully",
    data: result,
  });
});

export const getMyAddresses = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await addressService.getMyAddresses(Number(req.user!.id));

    successResponse(res, {
      statusCode: 200,
      data: result,
    });
  },
);

export const updateAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await addressService.updateAddress(
      Number(req.user!.id),
      id?.toString() ?? "",
      req.body,
    );

    successResponse(res, {
      statusCode: 200,
      message: "Address updated successfully",
      data: result,
    });
  },
);

export const deleteAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await addressService.deleteAddress(Number(req.user!.id), id?.toString() ?? "");

    successResponse(res, {
      statusCode: 200,
      message: "Address deleted successfully",
    });
  },
);
