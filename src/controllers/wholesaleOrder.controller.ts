import { Request, Response } from 'express';
import { asyncHandler } from '../utils/globalErrorHandler.util.js';
import { successResponse } from '../utils/response.util.js';
import prisma from '../utils/prismaClient.js';
import AppError from '../utils/AppError.util.js';

export const createWholesaleOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized: Please log in to create a wholesale order', 401);
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

  const result = await prisma.$transaction(async (tx: any) => {
    const resolvedItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const pId = String(item.productId);
      const qty = parseInt(item.quantity || 1, 10);

      // Verify the product exists
      const product = await tx.product.findUnique({
        where: { id: pId },
        include: { images: true, colors: true }
      });

      if (!product) {
        throw new AppError(`Product not found: ${pId}`, 404);
      }

      const dbPrice = product.wholesalePrice ?? product.shopPrice ?? product.retailPrice ?? 0;
      const dbTitle = product.name;
      const colorImage = product.images.find(
        (img: any) => img.color && img.color.toLowerCase() === (item.color || '').toLowerCase()
      );
      const dbImageSrc = colorImage ? colorImage.url : (product.images?.[0]?.url || '');

      calculatedSubtotal += dbPrice * qty;

      resolvedItems.push({
        productId: pId,
        title: dbTitle,
        price: dbPrice,
        quantity: qty,
        size: item.size || null,
        color: item.color || null,
        imageSrc: dbImageSrc || null,
      });

      // Decrement stock for the ordered color if present
      if (item.color) {
        const colorRecord = await tx.productColor.findFirst({
          where: {
            productId: pId,
            color: { equals: item.color }
          }
        });
        if (colorRecord) {
          await tx.productColor.update({
            where: { id: colorRecord.id },
            data: { stock: Math.max(0, colorRecord.stock - qty) }
          });
        }
      }

      // Recalculate global stock for product
      const allColors = await tx.productColor.findMany({
        where: { productId: pId }
      });
      if (allColors.length > 0) {
        const newGlobalStock = allColors.reduce((sum: number, c: any) => sum + c.stock, 0);
        await tx.product.update({
          where: { id: pId },
          data: { stock: newGlobalStock },
        });
      } else {
        await tx.product.update({
          where: { id: pId },
          data: { stock: Math.max(0, product.stock - qty) },
        });
      }
    }

    const calculatedShipping = 50; // flat rate
    const calculatedTotal = calculatedSubtotal + calculatedShipping;

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
    const orderItemsData = resolvedItems.map((item: any) => ({
      wholesaleOrderId: wholesaleOrder.id,
      productId: item.productId,
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

  const traderProducts = await prisma.product.findMany({
    where: { traderId },
    select: { id: true },
  });

  const traderProductIds = traderProducts.map((p: any) => p.id);

  const orders = await prisma.wholesaleOrder.findMany({
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

  const formattedOrders = orders.map((order: any) => {
    const traderItems = order.items.filter((item: any) => traderProductIds.includes(item.productId));
    const traderSubtotal = traderItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
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
      items: traderItems.map((item: any) => ({
        id: item.id,
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

  const traderProducts = await prisma.product.findMany({
    where: { traderId },
    select: { id: true },
  });

  const traderProductIds = traderProducts.map((p: any) => p.id);

  const order = await prisma.wholesaleOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('Wholesale order not found', 404);
  }

  const ownsProduct = order.items.some((item: any) => traderProductIds.includes(item.productId));
  if (!ownsProduct) {
    throw new AppError('Unauthorized: You do not own any products in this order', 403);
  }

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

  const traderProducts = await prisma.product.findMany({
    where: { traderId },
    select: { id: true },
  });

  const traderProductIds = traderProducts.map((p: any) => p.id);

  const order = await prisma.wholesaleOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('Wholesale order not found', 404);
  }

  const ownsProduct = order.items.some((item: any) => traderProductIds.includes(item.productId));
  if (!ownsProduct) {
    throw new AppError('Unauthorized: You do not own any products in this order', 403);
  }

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

  const formattedOrders = orders.map((order: any) => ({
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
    items: order.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
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

export const updateTraderWholesaleOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'trader') {
    throw new AppError('Unauthorized: Trader access only', 401);
  }

  const id = String(req.params.id);
  const { status, items, deletedItemIds } = req.body;

  const traderId = Number(req.user.id);

  const traderProducts = await prisma.product.findMany({
    where: { traderId },
    select: { id: true },
  });

  const traderProductIds = traderProducts.map((p: any) => p.id);

  const order = await prisma.wholesaleOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('Wholesale order not found', 404);
  }

  const ownsProduct = order.items.some((item: any) => traderProductIds.includes(item.productId));
  if (!ownsProduct) {
    throw new AppError('Unauthorized: You do not own any products in this order', 403);
  }

  const result = await prisma.$transaction(async (tx: any) => {
    if (status) {
      const allowedStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
      if (!allowedStatuses.includes(status.toUpperCase())) {
        throw new AppError('Invalid order status', 400);
      }
      await tx.wholesaleOrder.update({
        where: { id },
        data: { status: status.toUpperCase() },
      });
    }

    const affectedProductIds = new Set<string>();

    if (items && Array.isArray(items)) {
      for (const itemUpdate of items) {
        if (itemUpdate.id) {
          const existingItem = order.items.find((it: any) => it.id === itemUpdate.id);
          if (!existingItem) {
            throw new AppError(`Item ${itemUpdate.id} not found in this order`, 404);
          }

          if (!traderProductIds.includes(existingItem.productId)) {
            throw new AppError(`Unauthorized to update item ${itemUpdate.id}`, 403);
          }

          affectedProductIds.add(existingItem.productId);

          const newQty = itemUpdate.quantity !== undefined ? parseInt(itemUpdate.quantity, 10) : existingItem.quantity;
          const newPrice = itemUpdate.price !== undefined ? parseFloat(itemUpdate.price) : existingItem.price;

          if (newQty !== existingItem.quantity) {
            const diff = newQty - existingItem.quantity;
            if (existingItem.color) {
              const allColors = await tx.productColor.findMany({
                where: { productId: existingItem.productId }
              });
              const colorRecord = allColors.find((c: any) => c.color.toLowerCase() === existingItem.color!.toLowerCase());
              if (colorRecord) {
                if (diff > 0 && colorRecord.stock < diff) {
                  throw new AppError(`Insufficient stock for color ${existingItem.color}. Available: ${colorRecord.stock}`, 400);
                }
                await tx.productColor.update({
                  where: { id: colorRecord.id },
                  data: { stock: Math.max(0, colorRecord.stock - diff) }
                });
              }
            } else {
              const product = await tx.product.findUnique({
                where: { id: existingItem.productId },
                include: { colors: true }
              });
              if (product && (!product.colors || product.colors.length === 0)) {
                if (diff > 0 && product.stock < diff) {
                  throw new AppError(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400);
                }
                await tx.product.update({
                  where: { id: existingItem.productId },
                  data: { stock: Math.max(0, product.stock - diff) }
                });
              }
            }
          }

          await tx.wholesaleOrderItem.update({
            where: { id: itemUpdate.id },
            data: {
              quantity: newQty,
              price: newPrice,
            },
          });
        } else {
          const { productId, quantity, price, color, size } = itemUpdate;
          if (!productId || quantity === undefined || price === undefined) {
            throw new AppError('Product ID, quantity, and price are required for new items', 400);
          }

          if (!traderProductIds.includes(productId)) {
            throw new AppError(`Unauthorized to add product ${productId} to this order`, 403);
          }

          affectedProductIds.add(productId);

          const product = await tx.product.findUnique({
            where: { id: productId },
            include: { images: true }
          });

          if (!product) {
            throw new AppError(`Product not found: ${productId}`, 404);
          }

          const qtyNum = parseInt(quantity, 10);

          if (color) {
            const allColors = await tx.productColor.findMany({
              where: { productId }
            });
            const colorRecord = allColors.find((c: any) => c.color.toLowerCase() === color.toLowerCase());
            if (colorRecord) {
              if (colorRecord.stock < qtyNum) {
                throw new AppError(`Insufficient stock for color ${color}. Available: ${colorRecord.stock}`, 400);
              }
              await tx.productColor.update({
                where: { id: colorRecord.id },
                data: { stock: Math.max(0, colorRecord.stock - qtyNum) }
              });
            }
          } else {
            const product = await tx.product.findUnique({
              where: { id: productId },
              include: { colors: true }
            });
            if (product && (!product.colors || product.colors.length === 0)) {
              if (product.stock < qtyNum) {
                throw new AppError(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400);
              }
              await tx.product.update({
                where: { id: productId },
                data: { stock: Math.max(0, product.stock - qtyNum) }
              });
            }
          }

          const colorImage = product.images.find(
            (img: any) => img.color && img.color.toLowerCase() === (color || '').toLowerCase()
          );
          const dbImageSrc = colorImage ? colorImage.url : (product.images?.[0]?.url || '');

          await tx.wholesaleOrderItem.create({
            data: {
              wholesaleOrderId: id,
              productId: productId,
              title: product.name,
              price: parseFloat(price),
              quantity: qtyNum,
              color: color || null,
              size: size || null,
              imageSrc: dbImageSrc || null,
            }
          });
        }
      }
    }

    if (deletedItemIds && Array.isArray(deletedItemIds)) {
      for (const delId of deletedItemIds) {
        const itemToDelete = order.items.find((it: any) => it.id === String(delId));
        if (itemToDelete) {
          affectedProductIds.add(itemToDelete.productId);
          if (itemToDelete.color) {
            const allColors = await tx.productColor.findMany({
              where: { productId: itemToDelete.productId }
            });
            const colorRecord = allColors.find((c: any) => c.color.toLowerCase() === itemToDelete.color!.toLowerCase());
            if (colorRecord) {
              await tx.productColor.update({
                where: { id: colorRecord.id },
                data: { stock: colorRecord.stock + itemToDelete.quantity }
              });
            }
          } else {
            const product = await tx.product.findUnique({
              where: { id: itemToDelete.productId },
              include: { colors: true }
            });
            if (product && (!product.colors || product.colors.length === 0)) {
              await tx.product.update({
                where: { id: itemToDelete.productId },
                data: { stock: product.stock + itemToDelete.quantity }
              });
            }
          }
        }
      }

      await tx.wholesaleOrderItem.deleteMany({
        where: {
          id: { in: deletedItemIds.map(String) },
          wholesaleOrderId: id,
        },
      });
    }

    for (const pId of affectedProductIds) {
      const allColors = await tx.productColor.findMany({
        where: { productId: pId }
      });
      if (allColors.length > 0) {
        const newGlobalStock = allColors.reduce((sum: number, c: any) => sum + c.stock, 0);
        await tx.product.update({
          where: { id: pId },
          data: { stock: newGlobalStock },
        });
      }
    }

    const updatedItems = await tx.wholesaleOrderItem.findMany({
      where: { wholesaleOrderId: id }
    });

    const newSubtotal = updatedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const newTotal = newSubtotal + order.shipping;

    const updatedOrder = await tx.wholesaleOrder.update({
      where: { id },
      data: {
        subtotal: newSubtotal,
        total: newTotal,
      },
      include: {
        items: true,
      }
    });

    return updatedOrder;
  });

  const traderItems = result.items.filter((item: any) => traderProductIds.includes(item.productId));
  const traderSubtotal = traderItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

  const formattedOrder = {
    id: result.id,
    orderId: `#WS-${result.id.slice(-8).toUpperCase()}`,
    customer: `${result.firstName} ${result.lastName}`,
    customerEmail: result.email,
    customerPhone: result.phone,
    address: `${result.apartment ? `Apt ${result.apartment}, ` : ''}${result.streetAddress}, ${result.area}, ${result.city}, ${result.country}`,
    mapAddress: result.mapAddress,
    latitude: result.latitude,
    longitude: result.longitude,
    date: new Date(result.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
    time: new Date(result.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    payment: result.paymentMethod === "COD" ? "Cash" : "Card",
    total: `EGP ${result.total.toFixed(2)}`,
    subtotal: `EGP ${traderSubtotal.toFixed(2)}`,
    shipping: `EGP ${result.shipping.toFixed(2)}`,
    discount: `EGP ${result.discount.toFixed(2)}`,
    status: result.status,
    items: traderItems.map((item: any) => ({
      id: item.id,
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

  successResponse(res, {
    message: 'Wholesale order updated successfully',
    data: formattedOrder,
  });
});
