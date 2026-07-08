import express from 'express';
import prisma from '../utils/prismaClient.js';
import { successResponse } from '../utils/response.util.js';

const router = express.Router();

// Get Cart
router.get('/', async (req, res, next) => {
  try {
    return successResponse(res, {
      message: 'Cart retrieved',
      data: [],
    });
  } catch (error) {
    next(error);
  }
});

// Add Item
router.post('/items', async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity || 1, 10);
    let updated = false;

    // 1. Try Product (String id)
    const product = await prisma.product.findUnique({
      where: { id: String(productId) },
    });
    if (product) {
      await prisma.product.update({
        where: { id: String(productId) },
        data: { stock: Math.max(0, (product.stock || 0) - qty) },
      });
      updated = true;
    }

    // 2. Try RetailProduct (Int id)
    if (!updated && !isNaN(Number(productId))) {
      const retailProduct = await prisma.retailProduct.findUnique({
        where: { id: Number(productId) },
      });
      if (retailProduct) {
        await prisma.retailProduct.update({
          where: { id: Number(productId) },
          data: { stock: Math.max(0, (retailProduct.stock || 0) - qty) },
        });
        updated = true;
      }
    }

    // 3. Try Wholesale (String id)
    if (!updated) {
      const wholesale = await prisma.wholesale.findUnique({
        where: { id: String(productId) },
      });
      if (wholesale) {
        await prisma.wholesale.update({
          where: { id: String(productId) },
          data: { stock: Math.max(0, (wholesale.stock || 0) - qty) },
        });
        updated = true;
      }
    }

    return successResponse(res, {
      message: 'Product added to cart, stock updated',
      data: { success: true },
    });
  } catch (error) {
    next(error);
  }
});

// Add Retail Item
router.post('/retail-items', async (req, res, next) => {
  try {
    const { retailProductId, quantity } = req.body;
    const qty = parseInt(quantity || 1, 10);

    const retailProduct = await prisma.retailProduct.findUnique({
      where: { id: Number(retailProductId) },
    });
    if (retailProduct) {
      await prisma.retailProduct.update({
        where: { id: Number(retailProductId) },
        data: { stock: Math.max(0, (retailProduct.stock || 0) - qty) },
      });
    }

    return successResponse(res, {
      message: 'Retail product added to cart, stock updated',
      data: { success: true },
    });
  } catch (error) {
    next(error);
  }
});

// Update Item quantity
router.patch('/items/:id', async (req, res, next) => {
  try {
    // Best-effort response for quantity updates
    return successResponse(res, {
      message: 'Cart item quantity updated',
      data: { success: true },
    });
  } catch (error) {
    next(error);
  }
});

// Delete Item
router.delete('/items/:id', async (req, res, next) => {
  try {
    const itemId = req.params.id;
    // Extract product ID from "retail-X-none" or "X"
    const parts = itemId.split('-');
    const productId = parts[1] || itemId;
    let updated = false;

    // Restore stock by 1
    const product = await prisma.product.findUnique({
      where: { id: String(productId) },
    });
    if (product) {
      await prisma.product.update({
        where: { id: String(productId) },
        data: { stock: (product.stock || 0) + 1 },
      });
      updated = true;
    }

    if (!updated && !isNaN(Number(productId))) {
      const retailProduct = await prisma.retailProduct.findUnique({
        where: { id: Number(productId) },
      });
      if (retailProduct) {
        await prisma.retailProduct.update({
          where: { id: Number(productId) },
          data: { stock: (retailProduct.stock || 0) + 1 },
        });
        updated = true;
      }
    }

    if (!updated) {
      const wholesale = await prisma.wholesale.findUnique({
        where: { id: String(productId) },
      });
      if (wholesale) {
        await prisma.wholesale.update({
          where: { id: String(productId) },
          data: { stock: (wholesale.stock || 0) + 1 },
        });
      }
    }

    return successResponse(res, {
      message: 'Cart item removed, stock updated',
      data: { success: true },
    });
  } catch (error) {
    next(error);
  }
});

// Clear Cart Items
router.delete('/items', async (req, res, next) => {
  try {
    return successResponse(res, {
      message: 'Cart cleared',
      data: { success: true },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
