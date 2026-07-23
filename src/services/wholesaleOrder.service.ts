import AppError from '../utils/AppError.util.js';
import {
  wholesaleOrderRepository,
  Transaction,
} from '../repositories/wholesaleOrder.repository.js';

export interface CreateWholesaleOrderInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  area: string;
  streetAddress: string;
  apartment?: string;
  mapAddress?: string;
  latitude?: string | number;
  longitude?: string | number;
  total?: number;
  items: Array<{
    productId: string | number;
    quantity: number;
    size?: string;
    color?: string;
  }>;
}

export interface UpdateTraderWholesaleOrderInput {
  status?: string;
  items?: Array<{
    id?: string;
    productId?: string;
    quantity?: number | string;
    price?: number | string;
    color?: string;
    size?: string;
  }>;
  deletedItemIds?: Array<string | number>;
}

class WholesaleOrderService {
  private matchSizes(allSizes: any[], targetSizeStr?: string | null) {
    if (!targetSizeStr) return allSizes;
    const normalized = targetSizeStr.trim().toLowerCase();
    if (normalized === 'all sizes' || normalized === 'all' || normalized === '') {
      return allSizes;
    }
    const targetList = normalized.split(',').map((s) => s.trim()).filter(Boolean);
    const matched = allSizes.filter((sz) => targetList.includes(sz.size.toLowerCase()));
    return matched.length > 0 ? matched : allSizes;
  }

  async createWholesaleOrder(userId: number, payload: CreateWholesaleOrderInput) {
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
      items,
    } = payload;

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

    const result = await wholesaleOrderRepository.runInTransaction(async (tx: Transaction) => {
      const resolvedItems = [];
      let calculatedSubtotal = 0;

      for (const item of items) {
        const pId = String(item.productId);
        const qty = parseInt(String(item.quantity || 1), 10);

        const product = await wholesaleOrderRepository.findProductWithImagesAndColors(pId, tx);

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

        const isAllColors =
          !item.color ||
          item.color.trim().toLowerCase() === 'all colors' ||
          item.color.trim().toLowerCase() === 'all';

        const allColors = await wholesaleOrderRepository.findProductColors(pId, tx);

        const colorRecord = !isAllColors
          ? allColors.find(
              (c: any) => c.color.toLowerCase() === (item.color || '').trim().toLowerCase()
            )
          : null;

        if (colorRecord) {
          if (colorRecord.stock < qty) {
            throw new AppError(
              `Insufficient stock for color ${colorRecord.color} of ${product.name}. Available: ${colorRecord.stock}, requested: ${qty}`,
              400
            );
          }
          const sizesToUpdate = colorRecord.sizes;
          for (const sz of sizesToUpdate) {
            if (sz.quantity < qty) {
              throw new AppError(
                `Insufficient stock for size ${sz.size} in color ${colorRecord.color} of ${product.name}. Available: ${sz.quantity}, requested: ${qty}`,
                400
              );
            }
          }

          for (const sz of sizesToUpdate) {
            await wholesaleOrderRepository.updateProductSizeQuantity(
              sz.id,
              Math.max(0, sz.quantity - qty),
              tx
            );
          }
          const refreshedSizes = await wholesaleOrderRepository.findProductSizes(
            { productColorId: colorRecord.id },
            tx
          );
          if (refreshedSizes.length > 0) {
            const newColorStock = refreshedSizes.reduce((sum: number, s: any) => sum + s.quantity, 0);
            await wholesaleOrderRepository.updateProductColorStock(colorRecord.id, newColorStock, tx);
          } else {
            await wholesaleOrderRepository.updateProductColorStock(
              colorRecord.id,
              Math.max(0, colorRecord.stock - qty),
              tx
            );
          }
        } else if (allColors.length > 0) {
          for (const c of allColors) {
            if (c.stock < qty) {
              throw new AppError(
                `Insufficient stock for color ${c.color} of ${product.name}. Available: ${c.stock}, requested: ${qty}`,
                400
              );
            }
            const sizesToUpdate = c.sizes;
            for (const sz of sizesToUpdate) {
              if (sz.quantity < qty) {
                throw new AppError(
                  `Insufficient stock for size ${sz.size} in color ${c.color} of ${product.name}. Available: ${sz.quantity}, requested: ${qty}`,
                  400
                );
              }
            }

            for (const sz of sizesToUpdate) {
              await wholesaleOrderRepository.updateProductSizeQuantity(
                sz.id,
                Math.max(0, sz.quantity - qty),
                tx
              );
            }
            const refreshedSizes = await wholesaleOrderRepository.findProductSizes(
              { productColorId: c.id },
              tx
            );
            if (refreshedSizes.length > 0) {
              const newColorStock = refreshedSizes.reduce((sum: number, s: any) => sum + s.quantity, 0);
              await wholesaleOrderRepository.updateProductColorStock(c.id, newColorStock, tx);
            } else {
              await wholesaleOrderRepository.updateProductColorStock(
                c.id,
                Math.max(0, c.stock - qty),
                tx
              );
            }
          }
        } else {
          if (product.stock < qty) {
            throw new AppError(
              `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${qty}`,
              400
            );
          }
          const productSizes = await wholesaleOrderRepository.findProductSizes({ productId: pId }, tx);
          const sizesToUpdate = this.matchSizes(productSizes, item.size);
          for (const sz of sizesToUpdate) {
            if (sz.quantity < qty) {
              throw new AppError(
                `Insufficient stock for size ${sz.size} of ${product.name}. Available: ${sz.quantity}, requested: ${qty}`,
                400
              );
            }
          }

          await wholesaleOrderRepository.updateProductStock(
            pId,
            Math.max(0, product.stock - qty),
            tx
          );
          for (const sz of sizesToUpdate) {
            await wholesaleOrderRepository.updateProductSizeQuantity(
              sz.id,
              Math.max(0, sz.quantity - qty),
              tx
            );
          }
        }

        // Recalculate global stock for product
        const updatedColors = await wholesaleOrderRepository.findProductColors(pId, tx);
        if (updatedColors.length > 0) {
          const newGlobalStock = updatedColors.reduce((sum: number, c: any) => sum + c.stock, 0);
          await wholesaleOrderRepository.updateProductStock(pId, newGlobalStock, tx);
        }
      }

      const calculatedShipping = 50; // flat rate
      const calculatedTotal = calculatedSubtotal + calculatedShipping;

      const wholesaleOrder = await wholesaleOrderRepository.createWholesaleOrder(
        {
          userId,
          firstName,
          lastName,
          phone,
          email,
          country,
          city,
          area,
          streetAddress,
          apartment: apartment || '',
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
        tx
      );

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

      await wholesaleOrderRepository.createWholesaleOrderItems(orderItemsData, tx);

      return wholesaleOrderRepository.findWholesaleOrderById(wholesaleOrder.id, tx);
    });

    return result;
  }

  async getTraderWholesaleOrders(traderId: number) {
    const traderProductIds = await wholesaleOrderRepository.findTraderProductIds(traderId);
    const orders = await wholesaleOrderRepository.findWholesaleOrdersForTrader(traderProductIds);

    return orders.map((order: any) => {
      const traderItems = order.items.filter((item: any) => traderProductIds.includes(item.productId));
      const traderSubtotal = traderItems.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
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
        date: new Date(order.createdAt).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        createdAt: order.createdAt,
        time: new Date(order.createdAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        payment: order.paymentMethod === 'COD' ? 'Cash' : 'Card',
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
          image: item.imageSrc || '',
        })),
      };
    });
  }

  async updateTraderWholesaleOrderStatus(traderId: number, id: string, status: string) {
    if (!status) {
      throw new AppError('Please provide a status update', 400);
    }

    const allowedStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
    if (!allowedStatuses.includes(status.toUpperCase())) {
      throw new AppError(
        'Invalid order status. Allowed values: PENDING, PROCESSING, SHIPPED, COMPLETED, CANCELLED',
        400
      );
    }

    const traderProductIds = await wholesaleOrderRepository.findTraderProductIds(traderId);
    const order = await wholesaleOrderRepository.findWholesaleOrderById(id);

    if (!order) {
      throw new AppError('Wholesale order not found', 404);
    }

    const ownsProduct = order.items.some((item: any) => traderProductIds.includes(item.productId));
    if (!ownsProduct) {
      throw new AppError('Unauthorized: You do not own any products in this order', 403);
    }

    return wholesaleOrderRepository.updateWholesaleOrderStatus(id, status.toUpperCase());
  }

  async deleteTraderWholesaleOrder(traderId: number, id: string) {
    const traderProductIds = await wholesaleOrderRepository.findTraderProductIds(traderId);
    const order = await wholesaleOrderRepository.findWholesaleOrderById(id);

    if (!order) {
      throw new AppError('Wholesale order not found', 404);
    }

    const ownsProduct = order.items.some((item: any) => traderProductIds.includes(item.productId));
    if (!ownsProduct) {
      throw new AppError('Unauthorized: You do not own any products in this order', 403);
    }

    await wholesaleOrderRepository.deleteWholesaleOrder(id);
  }

  async getUserWholesaleOrders(userId: number) {
    const orders = await wholesaleOrderRepository.findWholesaleOrdersByUserId(userId);

    return orders.map((order: any) => ({
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
  }

  async updateTraderWholesaleOrder(
    traderId: number,
    id: string,
    payload: UpdateTraderWholesaleOrderInput
  ) {
    const { status, items, deletedItemIds } = payload;
    const traderProductIds = await wholesaleOrderRepository.findTraderProductIds(traderId);
    const order = await wholesaleOrderRepository.findWholesaleOrderById(id);

    if (!order) {
      throw new AppError('Wholesale order not found', 404);
    }

    const ownsProduct =
      order.items.length === 0 ||
      order.items.some((item: any) => traderProductIds.includes(item.productId)) ||
      (items && items.some((item: any) => item.productId && traderProductIds.includes(item.productId)));

    if (!ownsProduct) {
      throw new AppError('Unauthorized: You do not own any products in this order', 403);
    }

    const result = await wholesaleOrderRepository.runInTransaction(async (tx: Transaction) => {
      if (status) {
        const allowedStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
        if (!allowedStatuses.includes(status.toUpperCase())) {
          throw new AppError('Invalid order status', 400);
        }
        await wholesaleOrderRepository.updateWholesaleOrderStatus(id, status.toUpperCase(), tx);
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

            const newQty =
              itemUpdate.quantity !== undefined
                ? parseInt(String(itemUpdate.quantity), 10)
                : existingItem.quantity;
            const newPrice =
              itemUpdate.price !== undefined
                ? parseFloat(String(itemUpdate.price))
                : existingItem.price;

            if (newQty !== existingItem.quantity) {
              const diff = newQty - existingItem.quantity;
              if (existingItem.color) {
                const allColors = await wholesaleOrderRepository.findProductColors(
                  existingItem.productId,
                  tx
                );
                const colorRecord = allColors.find(
                  (c: any) => c.color.toLowerCase() === existingItem.color!.toLowerCase()
                );
                if (colorRecord) {
                  if (diff > 0 && colorRecord.stock < diff) {
                    throw new AppError(
                      `Insufficient stock for color ${existingItem.color}. Available: ${colorRecord.stock}`,
                      400
                    );
                  }
                  const sizesToUpdate = colorRecord.sizes;
                  if (diff > 0) {
                    for (const sz of sizesToUpdate) {
                      if (sz.quantity < diff) {
                        throw new AppError(
                          `Insufficient stock for size ${sz.size} in color ${existingItem.color}. Available: ${sz.quantity}`,
                          400
                        );
                      }
                    }
                  }
                  for (const sz of sizesToUpdate) {
                    await wholesaleOrderRepository.updateProductSizeQuantity(
                      sz.id,
                      Math.max(0, sz.quantity - diff),
                      tx
                    );
                  }
                  const refreshedSizes = await wholesaleOrderRepository.findProductSizes(
                    { productColorId: colorRecord.id },
                    tx
                  );
                  if (refreshedSizes.length > 0) {
                    const newColorStock = refreshedSizes.reduce(
                      (sum: number, s: any) => sum + s.quantity,
                      0
                    );
                    await wholesaleOrderRepository.updateProductColorStock(
                      colorRecord.id,
                      newColorStock,
                      tx
                    );
                  } else {
                    await wholesaleOrderRepository.updateProductColorStock(
                      colorRecord.id,
                      Math.max(0, colorRecord.stock - diff),
                      tx
                    );
                  }
                }
              } else {
                const product = await wholesaleOrderRepository.findProductById(
                  existingItem.productId,
                  tx
                );
                if (product && (!product.colors || product.colors.length === 0)) {
                  if (diff > 0 && product.stock < diff) {
                    throw new AppError(
                      `Insufficient stock for ${product.name}. Available: ${product.stock}`,
                      400
                    );
                  }
                  const productSizes = await wholesaleOrderRepository.findProductSizes(
                    { productId: existingItem.productId },
                    tx
                  );
                  const sizesToUpdate = this.matchSizes(productSizes, existingItem.size);
                  if (diff > 0) {
                    for (const sz of sizesToUpdate) {
                      if (sz.quantity < diff) {
                        throw new AppError(
                          `Insufficient stock for size ${sz.size} of ${product.name}. Available: ${sz.quantity}`,
                          400
                        );
                      }
                    }
                  }
                  for (const sz of sizesToUpdate) {
                    await wholesaleOrderRepository.updateProductSizeQuantity(
                      sz.id,
                      Math.max(0, sz.quantity - diff),
                      tx
                    );
                  }
                  await wholesaleOrderRepository.updateProductStock(
                    existingItem.productId,
                    Math.max(0, product.stock - diff),
                    tx
                  );
                }
              }
            }

            await wholesaleOrderRepository.updateWholesaleOrderItem(
              itemUpdate.id,
              {
                quantity: newQty,
                price: newPrice,
              },
              tx
            );
          } else {
            const { productId, quantity, price, color, size } = itemUpdate;
            if (!productId || quantity === undefined || price === undefined) {
              throw new AppError('Product ID, quantity, and price are required for new items', 400);
            }

            const pIdStr = String(productId);
            if (!traderProductIds.includes(pIdStr)) {
              throw new AppError(`Unauthorized to add product ${pIdStr} to this order`, 403);
            }

            affectedProductIds.add(pIdStr);

            const product = await wholesaleOrderRepository.findProductWithImagesAndColors(
              pIdStr,
              tx
            );

            if (!product) {
              throw new AppError(`Product not found: ${pIdStr}`, 404);
            }

            const qtyNum = parseInt(String(quantity), 10);

            if (color) {
              const allColors = await wholesaleOrderRepository.findProductColors(pIdStr, tx);
              const colorRecord = allColors.find(
                (c: any) => c.color.toLowerCase() === color.toLowerCase()
              );
              if (colorRecord) {
                if (colorRecord.stock < qtyNum) {
                  throw new AppError(
                    `Insufficient stock for color ${color}. Available: ${colorRecord.stock}`,
                    400
                  );
                }
                const sizesToUpdate = colorRecord.sizes;
                for (const sz of sizesToUpdate) {
                  if (sz.quantity < qtyNum) {
                    throw new AppError(
                      `Insufficient stock for size ${sz.size} in color ${color}. Available: ${sz.quantity}`,
                      400
                    );
                  }
                }
                for (const sz of sizesToUpdate) {
                  await wholesaleOrderRepository.updateProductSizeQuantity(
                    sz.id,
                    Math.max(0, sz.quantity - qtyNum),
                    tx
                  );
                }
                const refreshedSizes = await wholesaleOrderRepository.findProductSizes(
                  { productColorId: colorRecord.id },
                  tx
                );
                if (refreshedSizes.length > 0) {
                  const newColorStock = refreshedSizes.reduce(
                    (sum: number, s: any) => sum + s.quantity,
                    0
                  );
                  await wholesaleOrderRepository.updateProductColorStock(
                    colorRecord.id,
                    newColorStock,
                    tx
                  );
                } else {
                  await wholesaleOrderRepository.updateProductColorStock(
                    colorRecord.id,
                    Math.max(0, colorRecord.stock - qtyNum),
                    tx
                  );
                }
              }
            } else {
              const prod = await wholesaleOrderRepository.findProductById(pIdStr, tx);
              if (prod && (!prod.colors || prod.colors.length === 0)) {
                if (prod.stock < qtyNum) {
                  throw new AppError(
                    `Insufficient stock for ${prod.name}. Available: ${prod.stock}`,
                    400
                  );
                }
                const productSizes = await wholesaleOrderRepository.findProductSizes(
                  { productId: pIdStr },
                  tx
                );
                const sizesToUpdate = this.matchSizes(productSizes, size);
                for (const sz of sizesToUpdate) {
                  if (sz.quantity < qtyNum) {
                    throw new AppError(
                      `Insufficient stock for size ${sz.size} of ${prod.name}. Available: ${sz.quantity}`,
                      400
                    );
                  }
                }
                for (const sz of sizesToUpdate) {
                  await wholesaleOrderRepository.updateProductSizeQuantity(
                    sz.id,
                    Math.max(0, sz.quantity - qtyNum),
                    tx
                  );
                }
                await wholesaleOrderRepository.updateProductStock(
                  pIdStr,
                  Math.max(0, prod.stock - qtyNum),
                  tx
                );
              }
            }

            const colorImage = product.images.find(
              (img: any) => img.color && img.color.toLowerCase() === (color || '').toLowerCase()
            );
            const dbImageSrc = colorImage ? colorImage.url : (product.images?.[0]?.url || '');

            await wholesaleOrderRepository.createWholesaleOrderItem(
              {
                wholesaleOrderId: id,
                productId: pIdStr,
                title: product.name,
                price: parseFloat(String(price)),
                quantity: qtyNum,
                color: color || null,
                size: size || null,
                imageSrc: dbImageSrc || null,
              },
              tx
            );
          }
        }
      }

      if (deletedItemIds && Array.isArray(deletedItemIds)) {
        for (const delId of deletedItemIds) {
          const itemToDelete = order.items.find((it: any) => it.id === String(delId));
          if (itemToDelete) {
            affectedProductIds.add(itemToDelete.productId);
            if (itemToDelete.color) {
              const allColors = await wholesaleOrderRepository.findProductColors(
                itemToDelete.productId,
                tx
              );
              const colorRecord = allColors.find(
                (c: any) => c.color.toLowerCase() === itemToDelete.color!.toLowerCase()
              );
              if (colorRecord) {
                const sizesToUpdate = colorRecord.sizes;
                for (const sz of sizesToUpdate) {
                  await wholesaleOrderRepository.updateProductSizeQuantity(
                    sz.id,
                    sz.quantity + itemToDelete.quantity,
                    tx
                  );
                }
                const refreshedSizes = await wholesaleOrderRepository.findProductSizes(
                  { productColorId: colorRecord.id },
                  tx
                );
                if (refreshedSizes.length > 0) {
                  const newColorStock = refreshedSizes.reduce(
                    (sum: number, s: any) => sum + s.quantity,
                    0
                  );
                  await wholesaleOrderRepository.updateProductColorStock(
                    colorRecord.id,
                    newColorStock,
                    tx
                  );
                } else {
                  await wholesaleOrderRepository.updateProductColorStock(
                    colorRecord.id,
                    colorRecord.stock + itemToDelete.quantity,
                    tx
                  );
                }
              }
            } else {
              const prod = await wholesaleOrderRepository.findProductById(
                itemToDelete.productId,
                tx
              );
              if (prod && (!prod.colors || prod.colors.length === 0)) {
                const productSizes = await wholesaleOrderRepository.findProductSizes(
                  { productId: itemToDelete.productId },
                  tx
                );
                const sizesToUpdate = this.matchSizes(productSizes, itemToDelete.size);
                for (const sz of sizesToUpdate) {
                  await wholesaleOrderRepository.updateProductSizeQuantity(
                    sz.id,
                    sz.quantity + itemToDelete.quantity,
                    tx
                  );
                }
                await wholesaleOrderRepository.updateProductStock(
                  itemToDelete.productId,
                  prod.stock + itemToDelete.quantity,
                  tx
                );
              }
            }
          }
        }

        await wholesaleOrderRepository.deleteWholesaleOrderItems(
          deletedItemIds.map(String),
          id,
          tx
        );
      }

      for (const pId of affectedProductIds) {
        const allColors = await wholesaleOrderRepository.findProductColors(pId, tx);
        if (allColors.length > 0) {
          const newGlobalStock = allColors.reduce((sum: number, c: any) => sum + c.stock, 0);
          await wholesaleOrderRepository.updateProductStock(pId, newGlobalStock, tx);
        }
      }

      const updatedOrderBeforeTotal = await wholesaleOrderRepository.findWholesaleOrderById(
        id,
        tx
      );
      const updatedItems = updatedOrderBeforeTotal?.items || [];

      const newSubtotal = updatedItems.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
      const newTotal = newSubtotal + order.shipping;

      return wholesaleOrderRepository.updateWholesaleOrderTotals(
        id,
        {
          subtotal: newSubtotal,
          total: newTotal,
        },
        tx
      );
    });

    const traderItems = result.items.filter((item: any) => traderProductIds.includes(item.productId));
    const traderSubtotal = traderItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    return {
      id: result.id,
      orderId: `#WS-${result.id.slice(-8).toUpperCase()}`,
      customer: `${result.firstName} ${result.lastName}`,
      customerEmail: result.email,
      customerPhone: result.phone,
      address: `${result.apartment ? `Apt ${result.apartment}, ` : ''}${result.streetAddress}, ${result.area}, ${result.city}, ${result.country}`,
      mapAddress: result.mapAddress,
      latitude: result.latitude,
      longitude: result.longitude,
      date: new Date(result.createdAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      time: new Date(result.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      payment: result.paymentMethod === 'COD' ? 'Cash' : 'Card',
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
        image: item.imageSrc || '',
      })),
    };
  }
}

export const wholesaleOrderService = new WholesaleOrderService();
