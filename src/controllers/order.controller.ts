import type { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { orderService } from "../services/order.service.js";
import AppError from "../utils/AppError.util.js";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized: Please log in to complete checkout", 401);
  }

  const userId = Number(req.user.id);
  const result = await orderService.createOrder(userId, req.body);

  successResponse(res, {
    message: "Order created successfully",
    data: result,
    statusCode: 201,
  });
});

export const getUserOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized: Please log in to view your orders", 401);
  }

  const userId = Number(req.user.id);
  const orders = await orderService.getUserOrders(userId);

  successResponse(res, {
    message: "Orders fetched successfully",
    data: orders,
  });
});

export const getTraderOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== "trader") {
    throw new AppError("Unauthorized: Trader access only", 401);
  }

  const traderId = Number(req.user.id);
  const { type, categoryId, fromDate, toDate } = req.query;

  const formattedOrders = await orderService.getTraderOrders(traderId, {
    type: typeof type === "string" ? type : undefined,
    categoryId: typeof categoryId === "string" ? categoryId : undefined,
    fromDate: typeof fromDate === "string" ? fromDate : undefined,
    toDate: typeof toDate === "string" ? toDate : undefined,
  });

  successResponse(res, {
    message: "Trader orders fetched successfully",
    data: formattedOrders,
  });
});

export const updateTraderOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== "trader") {
    throw new AppError("Unauthorized: Trader access only", 401);
  }

  const id = String(req.params.id);
  const { status } = req.body;
  const traderId = Number(req.user.id);

  const updatedOrder = await orderService.updateTraderOrderStatus(traderId, id, status);

  successResponse(res, {
    message: "Order status updated successfully",
    data: updatedOrder,
  });
});

export const getTraderCustomers = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== "trader") {
    throw new AppError("Unauthorized: Trader access only", 401);
  }

  const traderId = Number(req.user.id);
  const customers = await orderService.getTraderCustomers(traderId);

  successResponse(res, {
    message: "Trader customers fetched successfully",
    data: customers,
  });
});
