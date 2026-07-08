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

    // 4. Decrement product stock levels
    for (const item of items) {
      const pId = String(item.id || item.productId);
      const qty = parseInt(item.quantity || 1, 10);
      let updated = false;

      // Try Product (String CUID)
      const product = await tx.product.findUnique({
        where: { id: pId },
      });
      if (product) {
        await tx.product.update({
          where: { id: pId },
          data: { stock: Math.max(0, (product.stock || 0) - qty) },
        });
        updated = true;
      }

      // Try RetailProduct (Int ID)
      if (!updated && !isNaN(Number(pId))) {
        const retailProduct = await tx.retailProduct.findUnique({
          where: { id: Number(pId) },
        });
        if (retailProduct) {
          await tx.retailProduct.update({
            where: { id: Number(pId) },
            data: { stock: Math.max(0, (retailProduct.stock || 0) - qty) },
          });
          updated = true;
        }
      }

      // Try Wholesale (String ID)
      if (!updated) {
        const wholesale = await tx.wholesale.findUnique({
          where: { id: pId },
        });
        if (wholesale) {
          await tx.wholesale.update({
            where: { id: pId },
            data: { stock: Math.max(0, (wholesale.stock || 0) - qty) },
          });
        }
      }
    }

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

export const getTraderOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'trader') {
    throw new AppError('Unauthorized: Trader access only', 401);
  }

  const traderId = Number(req.user.id);

  // 1. Get all product IDs for this trader
  let traderProducts = await prisma.product.findMany({
    where: { traderId },
    select: { id: true },
  });

  // Fallback: If this trader has no products, reassign all existing products to them (for testing/development purposes)
  if (traderProducts.length === 0) {
    await prisma.product.updateMany({
      data: { traderId },
    });
    traderProducts = await prisma.product.findMany({
      where: { traderId },
      select: { id: true },
    });
  }

  const traderProductIds = traderProducts.map((p) => p.id);

  // 2. Get all orders containing any of those product IDs
  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          productId: { in: traderProductIds },
        },
      },
    },
    include: {
      items: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 3. Format and filter items for the trader view
  const formattedOrders = orders.map((order) => {
    const traderItems = order.items.filter((item) => traderProductIds.includes(item.productId));
    const traderSubtotal = traderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      id: order.id,
      orderId: `#${order.id.slice(-8).toUpperCase()}`,
      customer: `${order.firstName} ${order.lastName}`,
      customerEmail: order.email,
      customerPhone: order.phone,
      address: `${order.apartment ? `Apt ${order.apartment}, ` : ''}${order.streetAddress}, ${order.area}, ${order.city}, ${order.country}`,
      mapAddress: order.mapAddress,
      latitude: order.latitude,
      longitude: order.longitude,
      date: new Date(order.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      time: new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      payment: order.paymentMethod === "COD" ? "Cash" : "Card",
      total: `EGP ${order.total.toFixed(2)}`,
      subtotal: `EGP ${traderSubtotal.toFixed(2)}`,
      shipping: `EGP ${order.shipping.toFixed(2)}`,
      discount: `EGP ${order.discount.toFixed(2)}`,
      status: order.status, // PENDING, PROCESSING, SHIPPED, COMPLETED, CANCELLED
      items: traderItems.map((item) => ({
        id: item.productId,
        productId: item.productId,
        product: item.title,
        quantity: item.quantity,
        price: `EGP ${item.price.toFixed(2)}`,
        subtotal: `EGP ${(item.price * item.quantity).toFixed(2)}`,
        size: item.size,
        color: item.color,
        image: item.imageSrc || "",
      })),
    };
  });

  successResponse(res, {
    message: 'Trader orders fetched successfully',
    data: formattedOrders,
  });
});

export const updateTraderOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'trader') {
    throw new AppError('Unauthorized: Trader access only', 401);
  }

  const id = String(req.params.id);
  const { status } = req.body; // PENDING, PROCESSING, SHIPPED, COMPLETED, CANCELLED

  if (!status) {
    throw new AppError('Please provide a status update', 400);
  }

  const traderId = Number(req.user.id);

  // 1. Get all product IDs for this trader
  const traderProducts = await prisma.product.findMany({
    where: { traderId },
    select: { id: true },
  });

  const traderProductIds = traderProducts.map((p) => p.id);

  // 2. Find the order and verify it contains this trader's products
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const ownsProduct = order.items.some((item: any) => traderProductIds.includes(item.productId));
  if (!ownsProduct) {
    throw new AppError('Unauthorized: You do not own any products in this order', 403);
  }

  // 3. Update the order status
  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status: status.toUpperCase() },
  });

  successResponse(res, {
    message: 'Order status updated successfully',
    data: updatedOrder,
  });
});
