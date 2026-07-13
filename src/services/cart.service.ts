import { cartRepository } from '../repositories/cart.repository.js';
import AppError from '../utils/AppError.util.js';
import prisma from '../utils/prismaClient.js';

async function populateCartCategories(cart: any) {
  if (!cart || !cart.items) return cart;
  const itemsWithCategory = await Promise.all(
    cart.items.map(async (item: any) => {
      let categoryId: string | null = null;
      try {
        if (item.productType === 'RETAIL') {
          const prod = await prisma.retailProduct.findUnique({
            where: { id: Number(item.productId) },
            select: { categoryId: true }
          });
          if (prod) categoryId = String(prod.categoryId);
        } else {
          const prod = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { categoryId: true }
          });
          if (prod) categoryId = String(prod.categoryId);
        }
      } catch (err) {
        console.error(`Failed to fetch category for product ${item.productId}:`, err);
      }
      return {
        ...item.toJSON ? item.toJSON() : item,
        categoryId
      };
    })
  );
  return {
    ...cart.toJSON ? cart.toJSON() : cart,
    items: itemsWithCategory
  };
}

export const cartService = {
  getCart: async (userId: number) => {
    let cart = await cartRepository.findCartByUserId(userId);
    if (!cart) {
      cart = await cartRepository.createCartForUser(userId);
    }
    return populateCartCategories(cart);
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
      } else {
        const wholesale = await prisma.wholesale.findUnique({
          where: { id: String(finalProductId) },
          include: { images: true }
        });
        if (wholesale) {
          title = wholesale.name;
          price = wholesale.price;
          
          // Use matching image for the selected color if available
          const colorImage = wholesale.images.find(
            img => img.color && img.color.toLowerCase() === (colorVal || '').toLowerCase()
          );
          imageSrc = colorImage ? colorImage.url : (wholesale.images?.[0]?.url || '');
          productType = 'WHOLESALE';
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

    return populateCartCategories(await cartRepository.findCartByUserId(userId));
  },

  updateItem: async (userId: number, itemId: string, quantity: number) => {
    const cart = await cartRepository.findCartByUserId(userId);
    if (!cart) throw new AppError('Cart not found', 404);

    await cartRepository.updateCartItemQuantity(itemId, parseInt(quantity as any, 10));
    return populateCartCategories(await cartRepository.findCartByUserId(userId));
  },

  removeItem: async (userId: number, itemId: string) => {
    const cart = await cartRepository.findCartByUserId(userId);
    if (!cart) throw new AppError('Cart not found', 404);

    await cartRepository.removeCartItem(itemId);
    return populateCartCategories(await cartRepository.findCartByUserId(userId));
  },

  clearCart: async (userId: number) => {
    const cart = await cartRepository.findCartByUserId(userId);
    if (cart) {
      await cartRepository.clearCart(cart.id);
    }
    return { success: true };
  }
};
