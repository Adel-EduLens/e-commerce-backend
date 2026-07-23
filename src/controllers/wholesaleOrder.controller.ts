import { Request, Response } from 'express';
import { asyncHandler } from '../utils/globalErrorHandler.util.js';
import { successResponse } from '../utils/response.util.js';
import AppError from '../utils/AppError.util.js';
import { wholesaleOrderService } from '../services/wholesaleOrder.service.js';

export const createWholesaleOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized: Please log in to create a wholesale order', 401);
  }

  const userId = Number(req.user.id);
  const result = await wholesaleOrderService.createWholesaleOrder(userId, req.body);

  successResponse(res, {
    message: 'Wholesale order created successfully',
    data: result,
    statusCode: 201,
  });
});

export const getTraderWholesaleOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'trader') {
    throw new AppError('Unauthorized: Trader access only', 401);
  }

  const traderId = Number(req.user.id);
  const formattedOrders = await wholesaleOrderService.getTraderWholesaleOrders(traderId);

  successResponse(res, {
    message: 'Trader wholesale orders fetched successfully',
    data: formattedOrders,
  });
});

export const updateTraderWholesaleOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'trader') {
      throw new AppError('Unauthorized: Trader access only', 401);
    }

    const id = String(req.params.id);
    const { status } = req.body;
    const traderId = Number(req.user.id);

    const updatedOrder = await wholesaleOrderService.updateTraderWholesaleOrderStatus(
      traderId,
      id,
      status
    );

    successResponse(res, {
      message: 'Wholesale order status updated successfully',
      data: updatedOrder,
    });
  }
);

export const deleteTraderWholesaleOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'trader') {
    throw new AppError('Unauthorized: Trader access only', 401);
  }

  const id = String(req.params.id);
  const traderId = Number(req.user.id);

  await wholesaleOrderService.deleteTraderWholesaleOrder(traderId, id);

  successResponse(res, {
    message: 'Wholesale order deleted successfully',
    data: null,
  });
});

export const getUserWholesaleOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized: Please log in to view your orders', 401);
  }

  const userId = Number(req.user.id);
  const formattedOrders = await wholesaleOrderService.getUserWholesaleOrders(userId);

  successResponse(res, {
    message: 'Wholesale orders fetched successfully',
    data: formattedOrders,
  });
});

export const updateTraderWholesaleOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'trader') {
    throw new AppError('Unauthorized: Trader access only', 401);
  }

  const id = String(req.params.id);
  const traderId = Number(req.user.id);

  const formattedOrder = await wholesaleOrderService.updateTraderWholesaleOrder(
    traderId,
    id,
    req.body
  );

  successResponse(res, {
    message: 'Wholesale order updated successfully',
    data: formattedOrder,
  });
});
