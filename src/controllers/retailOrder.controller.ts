import { Request, Response } from "express";

import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";

import { retailOrderService } from "../services/retailOrder.service.js";


export const createRetailOrder = asyncHandler(
  async (req: Request, res: Response) => {
     const userId = Number(req.user?.id);

    const order = await retailOrderService.createOrder(userId, req.body);

    successResponse(res, {
      statusCode: 201,
      message: "Retail order created successfully",
      data: order,
    });
  },
);

export const getMyRetailOrders = asyncHandler(async (req, res) => {
  const orders = await retailOrderService.getMyOrders(Number(req.user?.id));

  successResponse(res, {
    statusCode: 200,
    message: "Orders fetched successfully",
    data: orders,
  });
});

export const getRetailOrderById = asyncHandler(async (req, res) => {
  const order = await retailOrderService.getById(String(req.params.id), Number(req.user?.id));

  successResponse(res, {
    statusCode: 200,
    message: "Order fetched successfully",
    data: order,
  });
});

export const payDeposit = asyncHandler(async (req, res) => {
  const order = await retailOrderService.payDeposit(String(req.params.id), req.body.paymentId);

  successResponse(res, {
    statusCode: 200,
    message: "Deposit paid successfully",
    data: order,
  });
});

export const getAllRetailOrders = asyncHandler(async (req, res) => {
  const orders = await retailOrderService.getAll();

  successResponse(res, {
    statusCode: 200,
    message: "Orders fetched successfully",
    data: orders,
  });
});

export const verifyId = asyncHandler(async (req, res) => {
  const order = await retailOrderService.verifyId(String(req.params.id));

  successResponse(res, {
    statusCode: 200,
    message: "ID verified successfully",
    data: order,
  });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const order = await retailOrderService.updateStatus(String(req.params.id), req.body.status);

  successResponse(res, {
    statusCode: 200,
    message: "Status updated successfully",
    data: order,
  });
});
