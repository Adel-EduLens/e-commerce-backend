import type { Request, Response } from 'express';
import { cartService } from '../services/cart.service.js';
import { successResponse } from '../utils/response.util.js';
import { asyncHandler } from '../utils/globalErrorHandler.util.js';

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.getCart(Number(req.user!.id));
  successResponse(res, {
    message: 'Cart retrieved',
    data: cart,
  });
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.addItem(Number(req.user!.id), req.body);
  successResponse(res, {
    message: 'Item added to cart',
    data: cart,
  });
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.updateItem(Number(req.user!.id), String(req.params.id), req.body.quantity);
  successResponse(res, {
    message: 'Cart item updated',
    data: cart,
  });
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.removeItem(Number(req.user!.id), String(req.params.id));
  successResponse(res, {
    message: 'Cart item removed',
    data: cart,
  });
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  await cartService.clearCart(Number(req.user!.id));
  successResponse(res, {
    message: 'Cart cleared',
    data: { success: true },
  });
});
