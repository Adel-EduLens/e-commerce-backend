import { cartRepository } from '../repositories/cart.repository.js';
import AppError from '../utils/AppError.util.js';
import prisma from '../utils/prismaClient.js';
import { Cart, CartItem } from '@prisma/client';

type CartWithItems = Cart & { items: CartItem[] };

interface AddItemInput {
  productId?: string | number;
  retailProductId?: string | number;
  productType?: string;
  quantity?: number | string;
  size?: string;
  color?: string;
  retailSizeId?: string;
  retailColorId?: string;
  sizeId?: string;
  colorId?: string;
}

async function populateCartCategories(cart: CartWithItems | null) {
  if (!cart || !cart.items || cart.items.length === 0) return cart;

  const retailIds = cart.items
    .filter((item) => item.productType === 'RETAIL')
    .map((item) => Number(item.productId));
  
  const wholesaleIds = cart.items
    .filter((item) => item.productType === 'WHOLESALE')
    .map((item) => item.productId);

  const shopIds = cart.items
    .filter((item) => item.productType !== 'RETAIL' && item.productType !== 'WHOLESALE')
    .map((item) => item.productId);

  try {
    const [retailProducts, wholesaleProducts, shopProducts] = await Promise.all([
      retailIds.length > 0
        ? prisma.retailProduct.findMany({
            where: { id: { in: retailIds } },
            select: { id: true, categoryId: true }
          })
        : [],
      wholesaleIds.length > 0
        ? prisma.wholesale.findMany({
            where: { id: { in: wholesaleIds } },
            select: { id: true, categoryId: true, minOrder: true }
          })
        : [],
      shopIds.length > 0
        ? prisma.product.findMany({
            where: { id: { in: shopIds } },
            select: { id: true, categories: { select: { id: true }, take: 1 } }
          })
        : []
    ]);

    const retailMap = new Map(retailProducts.map((p) => [p.id, p]));
    const wholesaleMap = new Map(wholesaleProducts.map((p) => [p.id, p]));
    const shopMap = new Map(shopProducts.map((p) => [p.id, p]));

    const itemsWithCategory = cart.items.map((item) => {
      let categoryId: string | null = null;
      let minOrder: number | null = null;

      if (item.productType === 'RETAIL') {
        const prod = retailMap.get(Number(item.productId));
        if (prod) categoryId = String(prod.categoryId);
      } else if (item.productType === 'WHOLESALE') {
        const prod = wholesaleMap.get(item.productId);
        if (prod) {
          categoryId = String(prod.categoryId);
          minOrder = prod.minOrder;
        }
      } else {
        const prod = shopMap.get(item.productId) as any;
        if (prod && prod.categories && prod.categories.length > 0) categoryId = String(prod.categories[0].id);
      }

      const rawItem = item as unknown as { toJSON?: () => Record<string, unknown> } & CartItem;
      return {
        ...(rawItem.toJSON ? rawItem.toJSON() : rawItem),
        categoryId,
        minOrder
      };
    });

    const rawCart = cart as unknown as { toJSON?: () => Record<string, unknown> } & CartWithItems;
    return {
      ...(rawCart.toJSON ? rawCart.toJSON() : rawCart),
      items: itemsWithCategory
    };
  } catch (err) {
    console.error('Failed to batch fetch categories for cart items:', err);
    return cart;
  }
}

export const cartService = {
  getCart: async (userId: number) => {
    let cart = await cartRepository.findCartByUserId(userId);
    if (!cart) {
      cart = await cartRepository.createCartForUser(userId);
    }
    return populateCartCategories(cart);
  },

  addItem: async (userId: number, itemData: AddItemInput) => {
    let cart = await cartRepository.findCartByUserId(userId);
    if (!cart) {
      cart = await cartRepository.createCartForUser(userId);
    }

    const isRetail = 'retailProductId' in itemData || itemData.productType === 'RETAIL';
    const finalProductId = itemData.retailProductId || itemData.productId;
    const quantity = parseInt(String(itemData.quantity || 1), 10);
    
    let title = 'Product';
    let price = 0;
    let imageSrc = '';
    let productType = isRetail ? 'RETAIL' : 'STANDARD';

    let sizeVal = itemData.size || itemData.retailSizeId || itemData.sizeId || null;
    let colorVal = itemData.color || itemData.retailColorId || itemData.colorId || null;

    const product = await prisma.product.findUnique({
      where: { id: String(finalProductId) },
      include: { images: true }
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    title = product.name;
    productType = itemData.productType === 'RETAIL' ? 'RETAIL' : itemData.productType === 'WHOLESALE' ? 'WHOLESALE' : 'STANDARD';

    // Pricing logic based on type
    if (productType === 'RETAIL') {
      price = product.retailPrice ?? product.price;
    } else if (productType === 'WHOLESALE') {
      price = product.wholesalePrice ?? product.price;
    } else {
      const hasFlashDeal = product.isFlashDeals && 
                           product.flashDealPrice && 
                           product.flashDealEndsAt && 
                           new Date(product.flashDealEndsAt) > new Date();
      price = (hasFlashDeal && product.flashDealPrice) ? product.flashDealPrice : (product.shopPrice ?? product.price);
    }

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

    const existingItem = await cartRepository.findCartItem(
      cart.id,
      String(finalProductId),
      productType,
      sizeVal || undefined,
      colorVal || undefined
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

    await cartRepository.updateCartItemQuantity(itemId, parseInt(String(quantity), 10));
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
