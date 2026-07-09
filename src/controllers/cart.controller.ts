import type { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cart.service.js';
import { successResponse } from '../utils/response.util.js';

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.getCart(Number(req.user!.id));
    return successResponse(res, {
      message: 'Cart retrieved',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

export const addItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.addItem(Number(req.user!.id), req.body);
    return successResponse(res, {
      message: 'Item added to cart',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.updateItem(Number(req.user!.id), String(req.params.id), req.body.quantity);
    return successResponse(res, {
      message: 'Cart item updated',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.removeItem(Number(req.user!.id), String(req.params.id));
    return successResponse(res, {
      message: 'Cart item removed',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await cartService.clearCart(Number(req.user!.id));
    return successResponse(res, {
      message: 'Cart cleared',
      data: { success: true },
    });
  } catch (error) {
    next(error);
  }
};
