import { CartRepository } from '../repositories/cart.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import prismaClient from '../utils/prismaClient.js'
import AppError from '../utils/AppError.util.js'

const cartRepository = new CartRepository()

export class CartService {
  async getCart(userId: number) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }

    let cart = await cartRepository.findByUserId(userId)
    if (!cart) {
      cart = await cartRepository.createForUser(userId)
    }

    return this.normalizeCart(cart)
  }

  async addItem(userId: number, data: {
    productId?: string | null
    retailProductId?: number | null
    retailColorId?: number | null
    retailSizeId?: number | null
    quantity: number
  }) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Validate quantity
    if (!data.quantity || data.quantity < 1) {
      throw new AppError('Quantity must be at least 1', 400)
    }

    // Validate that either productId or retailProductId is provided, not both
    const hasProduct = Boolean(data.productId)
    const hasRetail = Boolean(data.retailProductId)

    if (!hasProduct && !hasRetail) {
      throw new AppError('Either productId or retailProductId must be provided', 400)
    }

    if (hasProduct && hasRetail) {
      throw new AppError('Choose either productId or retailProductId, not both', 400)
    }

    let cart = await cartRepository.findByUserId(userId)
    if (!cart) {
      cart = await cartRepository.createForUser(userId)
    }

    if (data.productId) {
      const product = await prismaClient.product.findUnique({ where: { id: data.productId } })
      if (!product) {
        throw new AppError('Product not found', 404)
      }
    } else if (data.retailProductId) {
      const retailProduct = await prismaClient.retailProduct.findUnique({
        where: { id: data.retailProductId },
        select: { id: true, stock: true, isActive: true }
      })

      if (!retailProduct || !retailProduct.isActive) {
        throw new AppError('Retail product not found or inactive', 404)
      }

      if (retailProduct.stock <= 0) {
        throw new AppError('Retail product is out of stock', 400)
      }

      if (data.retailSizeId) {
        const size = await prismaClient.retailProductSize.findUnique({
          where: { id: data.retailSizeId }
        })
        if (!size || size.productId !== data.retailProductId) {
          throw new AppError('Retail size is invalid for this product', 400)
        }
        if (size.stock !== null && size.stock < data.quantity) {
          throw new AppError('Requested quantity exceeds available size stock', 400)
        }
      }

      if (data.retailColorId) {
        const color = await prismaClient.retailProductColor.findUnique({
          where: { id: data.retailColorId }
        })
        if (!color || color.productId !== data.retailProductId) {
          throw new AppError('Retail color is invalid for this product', 400)
        }
      }
    }

    const existingItem = await cartRepository.findItemByCart(cart.id, {
      productId: data.productId ?? null,
      retailProductId: data.retailProductId ?? null,
      retailColorId: data.retailColorId ?? null,
      retailSizeId: data.retailSizeId ?? null
    })

    if (existingItem) {
      const newQuantity = existingItem.quantity + data.quantity
      if (data.retailProductId) {
        const product = await prismaClient.retailProduct.findUnique({
          where: { id: data.retailProductId },
          select: { stock: true }
        })
        if (product && newQuantity > product.stock) {
          throw new AppError('Requested quantity exceeds available stock', 400)
        }
      }

      const updatedItem = await cartRepository.updateItemQuantity(existingItem.id, newQuantity)
      return this.normalizeCart(await cartRepository.findByUserId(userId))
    }

    await cartRepository.createItem({
      cartId: cart.id,
      productId: data.productId ?? null,
      retailProductId: data.retailProductId ?? null,
      retailColorId: data.retailColorId ?? null,
      retailSizeId: data.retailSizeId ?? null,
      quantity: data.quantity
    })

    return this.normalizeCart(await cartRepository.findByUserId(userId))
  }

  async updateItemQuantity(userId: number, itemId: number, quantity: number) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }

    if (!quantity || quantity < 1) {
      throw new AppError('Quantity must be at least 1', 400)
    }

    const item = await prismaClient.cartItem.findUnique({ where: { id: itemId } })
    if (!item) {
      throw new AppError('Cart item not found', 404)
    }

    const cart = await cartRepository.findByUserId(userId)
    if (!cart || !cart.items.some((cartItem: any) => cartItem.id === itemId)) {
      throw new AppError('Cart item not found in your cart', 404)
    }

    if (item.retailProductId) {
      const retailProduct = await prismaClient.retailProduct.findUnique({
        where: { id: item.retailProductId },
        select: { stock: true }
      })
      if (retailProduct && quantity > retailProduct.stock) {
        throw new AppError('Requested quantity exceeds available stock', 400)
      }
    }

    await cartRepository.updateItemQuantity(itemId, quantity)
    return this.normalizeCart(await cartRepository.findByUserId(userId))
  }

  async removeItem(userId: number, itemId: number) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }

    const cart = await cartRepository.findByUserId(userId)
    if (!cart || !cart.items.some((cartItem: any) => cartItem.id === itemId)) {
      throw new AppError('Cart item not found in your cart', 404)
    }

    await cartRepository.removeItem(itemId)
    return this.normalizeCart(await cartRepository.findByUserId(userId))
  }

  async clearCart(userId: number) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }

    const cart = await cartRepository.findByUserId(userId)
    if (!cart) {
      return this.normalizeCart(await cartRepository.createForUser(userId))
    }

    await cartRepository.clearCart(cart.id)
    return this.normalizeCart(await cartRepository.findByUserId(userId))
  }

  private normalizeCart(cart: any) {
    const items = (cart?.items || []).map((item: any) => {
      const unitPrice = item.retailProduct
        ? (item.retailProduct.discountPrice ?? item.retailProduct.price)
        : item.product?.price ?? 0

      return {
        id: item.id,
        type: item.retailProductId ? 'RETAIL_PRODUCT' : 'PRODUCT',
        productId: item.productId,
        retailProductId: item.retailProductId,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
        product: item.product ?? null,
        retailProduct: item.retailProduct ?? null,
        retailColor: item.retailColor ?? null,
        retailSize: item.retailSize ?? null
      }
    })

    const subtotal = items.reduce((sum: number, item: any) => sum + item.totalPrice, 0)

    return {
      id: cart?.id,
      userId: cart?.userId,
      items,
      subtotal
    }
  }
}
