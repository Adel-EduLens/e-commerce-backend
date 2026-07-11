import { cartRepository } from '../repositories/cart.repository.js';
import AppError from '../utils/AppError.util.js';
import prisma from '../utils/prismaClient.js';

export const cartService = {
  getCart: async (userId: number) => {
    let cart = await cartRepository.findCartByUserId(userId);
    if (!cart) {
      cart = await cartRepository.createCartForUser(userId);
    }
    return cart;
  },

  addItem: async (userId: number, itemData: any) => {
    let cart = await cartRepository.findCartByUserId(userId);
    if (!cart) {
      cart = await cartRepository.createCartForUser(userId);
    }

    const isRetail = 'retailProductId' in itemData || itemData.productType === 'RETAIL';
    const finalProductId = itemData.retailProductId || itemData.productId;
    const quantity = parseInt(itemData.quantity || 1, 10);
    
    let title = 'Product';
    let price = 0;
    let imageSrc = '';
    let productType = isRetail ? 'RETAIL' : 'STANDARD';

    let sizeVal = itemData.size || itemData.retailSizeId || itemData.sizeId || null;
    let colorVal = itemData.color || itemData.retailColorId || itemData.colorId || null;

    if (isRetail && !isNaN(Number(finalProductId))) {
      const retailProduct = await prisma.retailProduct.findUnique({
        where: { id: Number(finalProductId) },
        include: { images: true }
      });
      if (retailProduct) {
        title = retailProduct.name;
        price = retailProduct.discountPrice || retailProduct.price;

        // Resolve default/missing values
        if (!colorVal || colorVal === 'Default') {
          const firstColor = await prisma.retailProductColor.findFirst({
            where: { productId: retailProduct.id }
          });
          if (firstColor) {
            colorVal = firstColor.name;
          }
        }
        if (!sizeVal || sizeVal === 'Default' || sizeVal.includes('XS - XXL')) {
          const firstSize = await prisma.retailProductSize.findFirst({
            where: { productId: retailProduct.id }
          });
          if (firstSize) {
            sizeVal = firstSize.name;
          }
        }

        imageSrc = retailProduct.images?.[0]?.url || '';
        
        await prisma.retailProduct.update({
          where: { id: retailProduct.id },
          data: { stock: Math.max(0, (retailProduct.stock || 0) - quantity) }
        });
      } else {
        throw new AppError('Retail product not found', 404);
      }
    } else {
      const product = await prisma.product.findUnique({
        where: { id: String(finalProductId) },
        include: { images: true }
      });
      if (product) {
        title = product.name;
        
        // Handle flash deal price if active
        const hasFlashDeal = product.isFlashDeals && 
                             product.flashDealPrice && 
                             product.flashDealEndsAt && 
                             new Date(product.flashDealEndsAt) > new Date();
        price = (hasFlashDeal && product.flashDealPrice) ? product.flashDealPrice : product.price;

        // Resolve default/missing values
        if (!colorVal || colorVal === 'Default') {
          const firstColor = await prisma.productColor.findFirst({
            where: { productId: product.id }
          });
          if (firstColor) {
            colorVal = firstColor.color;
          }
        }
        if (!sizeVal || sizeVal === 'Default' || sizeVal.includes('XS - XXL')) {
          let firstSize = await prisma.productSize.findFirst({
            where: { productId: product.id, color: colorVal }
          });
          if (!firstSize) {
            firstSize = await prisma.productSize.findFirst({
              where: { productId: product.id }
            });
          }
          if (firstSize) {
            sizeVal = firstSize.size;
          }
        }

        // Use the matching image for the selected color
        const colorImage = product.images.find(
          img => img.color && img.color.toLowerCase() === (colorVal || '').toLowerCase()
        );
        imageSrc = colorImage ? colorImage.url : (product.images?.[0]?.url || '');
        productType = 'STANDARD';
        
        // Decrement global stock
        await prisma.product.update({
          where: { id: product.id },
          data: { stock: Math.max(0, (product.stock || 0) - quantity) }
        });

        // Decrement size-specific stock
        if (sizeVal) {
          const sizeRecord = await prisma.productSize.findFirst({
            where: {
              productId: product.id,
              size: sizeVal,
              color: colorVal,
            }
          });
          if (sizeRecord) {
            await prisma.productSize.update({
              where: { id: sizeRecord.id },
              data: { quantity: Math.max(0, (sizeRecord.quantity || 0) - quantity) }
            });
          }
        }
      } else {
        const wholesale = await prisma.wholesale.findUnique({
          where: { id: String(finalProductId) },
          include: { images: true }
        });
        if (wholesale) {
          title = wholesale.name;
          price = wholesale.price;
          imageSrc = wholesale.images?.[0]?.url || '';
          productType = 'WHOLESALE';
          
          await prisma.wholesale.update({
            where: { id: wholesale.id },
            data: { stock: Math.max(0, (wholesale.stock || 0) - quantity) }
          });
        }
      }
    }

    const existingItem = await cartRepository.findCartItem(
      cart.id,
      String(finalProductId),
      sizeVal,
      colorVal
    );

    if (existingItem) {
      await cartRepository.updateCartItemQuantity(
        existingItem.id,
        existingItem.quantity + quantity
      );
    } else {
      await cartRepository.addCartItem({
        cartId: cart.id,
        productId: String(finalProductId),
        productType,
        title,
        price,
        quantity,
        size: sizeVal,
        color: colorVal,
        imageSrc,
      });
    }

    return cartRepository.findCartByUserId(userId);
  },

  updateItem: async (userId: number, itemId: string, quantity: number) => {
    const cart = await cartRepository.findCartByUserId(userId);
    if (!cart) throw new AppError('Cart not found', 404);

    await cartRepository.updateCartItemQuantity(itemId, parseInt(quantity as any, 10));
    return cartRepository.findCartByUserId(userId);
  },

  removeItem: async (userId: number, itemId: string) => {
    const cart = await cartRepository.findCartByUserId(userId);
    if (!cart) throw new AppError('Cart not found', 404);

    // Get item first to restore stock
    const cartItem = cart.items.find(i => i.id === itemId);
    if (cartItem) {
      const qty = cartItem.quantity;
      try {
        if (cartItem.productType === 'RETAIL' && !isNaN(Number(cartItem.productId))) {
          const retailProduct = await prisma.retailProduct.findUnique({ where: { id: Number(cartItem.productId) } });
          if (retailProduct) {
            await prisma.retailProduct.update({
              where: { id: Number(cartItem.productId) },
              data: { stock: (retailProduct.stock || 0) + qty },
            });
          }
        } else if (cartItem.productType === 'WHOLESALE') {
          const wholesale = await prisma.wholesale.findUnique({ where: { id: String(cartItem.productId) } });
          if (wholesale) {
            await prisma.wholesale.update({
              where: { id: String(cartItem.productId) },
              data: { stock: (wholesale.stock || 0) + qty },
            });
          }
        } else {
          const product = await prisma.product.findUnique({ where: { id: String(cartItem.productId) } });
          if (product) {
            await prisma.product.update({
              where: { id: String(cartItem.productId) },
              data: { stock: (product.stock || 0) + qty },
            });

            // Restore size variant stock if applicable
            if (cartItem.size) {
              const sizeRecord = await prisma.productSize.findFirst({
                where: {
                  productId: product.id,
                  size: cartItem.size,
                  color: cartItem.color || null,
                }
              });
              if (sizeRecord) {
                await prisma.productSize.update({
                  where: { id: sizeRecord.id },
                  data: { quantity: (sizeRecord.quantity || 0) + qty },
                });
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to restore stock:', e);
      }
    }

    await cartRepository.removeCartItem(itemId);
    return cartRepository.findCartByUserId(userId);
  },

  clearCart: async (userId: number) => {
    const cart = await cartRepository.findCartByUserId(userId);
    if (cart) {
      await cartRepository.clearCart(cart.id);
    }
    return { success: true };
  }
};
