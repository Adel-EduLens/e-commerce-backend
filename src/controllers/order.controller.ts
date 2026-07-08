import { Request, Response } from 'express';
import { asyncHandler } from '../utils/globalErrorHandler.util.js';
import { successResponse } from '../utils/response.util.js';
import prisma from '../utils/prismaClient.js';
import AppError from '../utils/AppError.util.js';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized: Please log in to complete checkout', 401);
  }

  const userId = Number(req.user.id);
  const {
    firstName,
    lastName,
    phone,
    email,
    country,
    city,
    area,
    streetAddress,
    apartment,
    mapAddress,
    latitude,
    longitude,
    subtotal,
    discount,
    shipping,
    total,
    couponCode,
    paymentMethod,
    items,
  } = req.body;

  // Basic validation
  if (
    !firstName ||
    !lastName ||
    !phone ||
    !email ||
    !country ||
    !city ||
    !area ||
    !streetAddress ||
    !paymentMethod ||
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new AppError('Please fill in all required delivery details and add items to your cart', 400);
  }

  // Run database transaction to create order, its items, and update coupon usage
  const result = await prisma.$transaction(async (tx) => {
    // 1. If coupon code is used, validate it and record usage
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await tx.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon) {
        if (!coupon.isActive || coupon.validUntil < new Date()) {
          throw new AppError('Used coupon is invalid or has expired', 400);
        }
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
          throw new AppError('Used coupon usage limit has been reached', 400);
        }

        // Increment usedCount
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });

        // Create CouponUsage record
        await tx.couponUsage.create({
          data: {
            couponId: coupon.id,
            userId: userId,
          },
        });
        
        appliedCoupon = coupon;
      }
    }

    // 2. Create the Order
    const order = await tx.order.create({
      data: {
        userId,
        firstName,
        lastName,
        phone,
        email,
        country,
        city,
        area,
        streetAddress,
        apartment,
        mapAddress: mapAddress || null,
        latitude: latitude ? String(latitude) : null,
        longitude: longitude ? String(longitude) : null,
        subtotal: parseFloat(subtotal),
        discount: parseFloat(discount),
        shipping: parseFloat(shipping),
        total: parseFloat(total),
        couponCode: couponCode || null,
        paymentMethod: paymentMethod.toUpperCase(),
        status: 'PENDING',
      },
    });

    // 3. Create the OrderItems
    const orderItemsData = items.map((item: any) => ({
      orderId: order.id,
      productId: String(item.id || item.productId),
      title: item.title,
      price: parseFloat(item.unitPrice || item.price),
      quantity: parseInt(item.quantity, 10),
      size: item.size || null,
      color: item.color || null,
      imageSrc: item.imageSrc || null,
    }));

    await tx.orderItem.createMany({
      data: orderItemsData,
    });

    // Return the created order with its items included
    return tx.order.findUnique({
      where: { id: order.id },
      include: {
        items: true,
      },
    });
  });

  successResponse(res, {
    message: 'Order created successfully',
    data: result,
    statusCode: 211, // or 201 Created
  });
});

export const getUserOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized: Please log in to view your orders', 401);
  }

  const userId = Number(req.user.id);

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  successResponse(res, {
    message: 'Orders fetched successfully',
    data: orders,
  });
});
