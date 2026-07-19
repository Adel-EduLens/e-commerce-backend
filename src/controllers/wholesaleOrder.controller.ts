import { Request, Response } from 'express';
import { asyncHandler } from '../utils/globalErrorHandler.util.js';
import { successResponse } from '../utils/response.util.js';
import prisma from '../utils/prismaClient.js';
import AppError from '../utils/AppError.util.js';

export const createWholesaleOrder = asyncHandler(async (req: Request, res: Response) => {
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
    total,
    items,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !phone ||
    !email ||
    !country ||
    !city ||
    !area ||
    !streetAddress ||
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new AppError('Please fill in all required delivery details and add items to your cart', 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const resolvedItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const pId = String(item.productId);
      const qty = parseInt(item.quantity || 1, 10);

      // Verify the wholesale item exists
      const wholesale = await tx.wholesale.findUnique({
        where: { id: pId },
        include: { images: true }
      });

      if (!wholesale) {
        throw new AppError(`Wholesale product not found: ${pId}`, 404);
      }

      const dbPrice = wholesale.price;
      const dbTitle = wholesale.name;
      const colorImage = wholesale.images.find(
        img => img.color && img.color.toLowerCase() === (item.color || '').toLowerCase()
      );
      const dbImageSrc = colorImage ? colorImage.url : (wholesale.images?.[0]?.url || '');

      calculatedSubtotal += dbPrice * qty;

      resolvedItems.push({
        wholesaleId: pId,
        title: dbTitle,
        price: dbPrice,
        quantity: qty,
        size: item.size || null,
        color: item.color || null,
        imageSrc: dbImageSrc || null,
      });

      // Decrement stock for the ordered color
      if (item.color) {
        const colorRecord = await tx.wholesaleColor.findFirst({
          where: {
            wholesaleId: pId,
            color: { equals: item.color }
          }
        });
        if (colorRecord) {
          await tx.wholesaleColor.update({
            where: { id: colorRecord.id },
            data: { stock: Math.max(0, colorRecord.stock - qty) }
          });
        }
      }

      // Recalculate global stock for wholesale product
      const allColors = await tx.wholesaleColor.findMany({
        where: { wholesaleId: pId }
      });
      const newGlobalStock = allColors.reduce((sum, c) => sum + c.stock, 0);

      await tx.wholesale.update({
        where: { id: pId },
        data: { stock: newGlobalStock },
      });
    }

    const calculatedShipping = 50; // flat rate matching front-end
    const calculatedTotal = calculatedSubtotal + calculatedShipping;

    // Validate client-provided values to prevent total tampering (with safe float epsilon check)
    if (Math.abs(calculatedTotal - parseFloat(total)) > 1.0) {
      throw new AppError('Order total manipulation detected or calculation mismatch', 400);
    }

    // Create the WholesaleOrder
    const wholesaleOrder = await tx.wholesaleOrder.create({
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
        subtotal: calculatedSubtotal,
        discount: 0,
        shipping: calculatedShipping,
        total: calculatedTotal,
        paymentMethod: 'COD',
        status: 'PENDING',
      },
    });

    // Create the WholesaleOrderItems
    const orderItemsData = resolvedItems.map((item) => ({
      wholesaleOrderId: wholesaleOrder.id,
      wholesaleId: item.wholesaleId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      imageSrc: item.imageSrc,
    }));

    await tx.wholesaleOrderItem.createMany({
      data: orderItemsData,
    });

    return tx.wholesaleOrder.findUnique({
      where: { id: wholesaleOrder.id },
      include: {
        items: true,
      },
    });
  });

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

  // 1. Get all wholesale product IDs for this trader
  const traderWholesales = await prisma.wholesale.findMany({
    where: { traderId },
    select: { id: true },
  });

  const traderWholesaleIds = traderWholesales.map((w) => w.id);

  // 2. Get all wholesale orders containing any of those wholesale IDs
  const orders = await prisma.wholesaleOrder.findMany({
    where: {
      items: {
        some: {
          wholesaleId: { in: traderWholesaleIds },
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
    const traderItems = order.items.filter((item) => traderWholesaleIds.includes(item.wholesaleId));
    const traderSubtotal = traderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      id: order.id,
      orderId: `#WS-${order.id.slice(-8).toUpperCase()}`,
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
      status: order.status,
      items: traderItems.map((item) => ({
        id: item.id,
        productId: item.wholesaleId,
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
    message: 'Trader wholesale orders fetched successfully',
    data: formattedOrders,
  });
});

export const updateTraderWholesaleOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'trader') {
    throw new AppError('Unauthorized: Trader access only', 401);
  }

  const id = String(req.params.id);
  const { status } = req.body;

  if (!status) {
    throw new AppError('Please provide a status update', 400);
  }

  const allowedStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
  if (!allowedStatuses.includes(status.toUpperCase())) {
    throw new AppError('Invalid order status. Allowed values: PENDING, PROCESSING, SHIPPED, COMPLETED, CANCELLED', 400);
  }

  const traderId = Number(req.user.id);

  // Get all wholesale products for this trader
  const traderWholesales = await prisma.wholesale.findMany({
    where: { traderId },
    select: { id: true },
  });

  const traderWholesaleIds = traderWholesales.map((w) => w.id);

  // Find the wholesale order and verify it contains this trader's products
  const order = await prisma.wholesaleOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('Wholesale order not found', 404);
  }

  const ownsProduct = order.items.some((item) => traderWholesaleIds.includes(item.wholesaleId));
  if (!ownsProduct) {
    throw new AppError('Unauthorized: You do not own any products in this order', 403);
  }

  // Update order status
  const updatedOrder = await prisma.wholesaleOrder.update({
    where: { id },
    data: { status: status.toUpperCase() },
  });

  successResponse(res, {
    message: 'Wholesale order status updated successfully',
    data: updatedOrder,
  });
});

export const deleteTraderWholesaleOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'trader') {
    throw new AppError('Unauthorized: Trader access only', 401);
  }

  const id = String(req.params.id);
  const traderId = Number(req.user.id);

  // Get all wholesale products for this trader
  const traderWholesales = await prisma.wholesale.findMany({
    where: { traderId },
    select: { id: true },
  });

  const traderWholesaleIds = traderWholesales.map((w) => w.id);

  // Find the wholesale order and verify it contains this trader's products
  const order = await prisma.wholesaleOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('Wholesale order not found', 404);
  }

  const ownsProduct = order.items.some((item) => traderWholesaleIds.includes(item.wholesaleId));
  if (!ownsProduct) {
    throw new AppError('Unauthorized: You do not own any products in this order', 403);
  }

  // Delete the wholesale order (Prisma Cascade relation will clean up items)
  await prisma.wholesaleOrder.delete({
    where: { id },
  });

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

  const orders = await prisma.wholesaleOrder.findMany({
    where: { userId },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const formattedOrders = orders.map((order) => ({
    id: order.id,
    firstName: order.firstName,
    lastName: order.lastName,
    phone: order.phone,
    email: order.email,
    country: order.country,
    city: order.city,
    area: order.area,
    streetAddress: order.streetAddress,
    apartment: order.apartment,
    mapAddress: order.mapAddress,
    latitude: order.latitude,
    longitude: order.longitude,
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    total: order.total,
    couponCode: null,
    status: order.status,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    isWholesaleOrder: true,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.wholesaleId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      imageSrc: item.imageSrc,
    })),
  }));

  successResponse(res, {
    message: 'Wholesale orders fetched successfully',
    data: formattedOrders,
  });
});

