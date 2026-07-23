import { Request, Response } from "express";
import { asyncHandler } from '../utils/globalErrorHandler.util.js';
import { successResponse } from '../utils/response.util.js';
import AppError from '../utils/AppError.util.js';
import { couponService } from "../services/coupon.service.js";

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const validUntilDate = new Date(req.body.validUntil);
    if (isNaN(validUntilDate.getTime())) {
        throw new AppError("Invalid validUntil date format", 400);
    }

    const result = await couponService.create({
        ...req.body,
        validUntil: validUntilDate,
        traderId
    });
    
    successResponse(res, {
        statusCode: 201,
        message: "Coupon created successfully",
        data: result,
    });
});

export const getCoupons = asyncHandler(async (req: Request, res: Response) => {
    // If the authenticated user is a trader, filter by their traderId
    const filter: { traderId?: number } = {};
    if (req.user && req.user.role === 'trader') {
        filter.traderId = Number(req.user.id);
    }
    
    const result = await couponService.getAll(filter);

    successResponse(res, {
        message: "Coupons fetched successfully",
        data: result,
    });
});

export const getCoupon = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await couponService.getById(id);

    successResponse(res, {
        message: "Coupon fetched successfully",
        data: result,
    });
});

export const getCouponByCode = asyncHandler(async (req: Request, res: Response) => {
    const code = String(req.params.code).toUpperCase();
    const userId = req.user ? Number(req.user.id) : undefined;
    const result = await couponService.getByCode(code, userId);

    successResponse(res, {
        message: "Coupon is valid",
        data: result,
    });
});

export const useCoupon = asyncHandler(async (req: Request, res: Response) => {
    const code = String(req.params.code).toUpperCase();
    const userId = Number(req.user!.id);
    const result = await couponService.use(code, userId);

    successResponse(res, {
        message: "Coupon used successfully",
        data: result,
    });
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const traderId = Number(req.user!.id);
    
    let validUntil: Date | undefined = undefined;
    if (req.body.validUntil) {
        validUntil = new Date(req.body.validUntil);
        if (isNaN(validUntil.getTime())) {
            throw new AppError("Invalid validUntil date format", 400);
        }
    }

    const result = await couponService.update(id, traderId, {
        ...req.body,
        validUntil
    });

    successResponse(res, {
        message: "Coupon updated successfully",
        data: result,
    });
});

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const traderId = Number(req.user!.id);
    
    await couponService.delete(id, traderId);

    successResponse(res, {
        message: "Coupon deleted successfully",
    });
});

export const getCouponAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const result = await couponService.getAnalytics(traderId);

    successResponse(res, {
        message: "Coupon analytics fetched successfully",
        data: result,
    });
});

