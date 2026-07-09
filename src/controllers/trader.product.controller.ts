import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import { productService } from '../services/product.service.js'
import prisma from '../utils/prismaClient.js'
import AppError from '../utils/AppError.util.js'

function buildImageUrl(req: Request, filename: string) {
  return `${req.protocol}://${req.get('host')}/uploads/products/${filename}`
}

async function getProductAndVerifyOwner(productId: string, traderId: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) throw new AppError('Product not found', 404)
  if (product.traderId !== traderId) throw new AppError('Forbidden', 403)
  return product
}

export const createTraderProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id)
    const body = req.body
    const files = (req.files as Express.Multer.File[]) || []

    // Parse colors JSON: [{ name, color, code, sizes: [{ size, quantity }] }]
    let parsedColors: { name: string; color: string; code: string; sizes: { size: string; quantity: number }[] }[] = []
    if (body.colors) {
      parsedColors = typeof body.colors === 'string' ? JSON.parse(body.colors) : body.colors
    }

    // Build images array from uploaded files
    const images: { url: string; color: string }[] = []
    for (const file of files) {
      const colorName = file.fieldname.replace(/^images_/, '')
      images.push({
        url: buildImageUrl(req, file.filename),
        color: colorName,
      })
    }

    // Build sizes and colors arrays from parsed colors
    const sizes: string[] = []
    const colors: string[] = []
    for (const c of parsedColors) {
      const colorName = c.name || c.color
      if (colorName && !colors.includes(colorName)) {
        colors.push(colorName)
      }
      for (const s of c.sizes || []) {
        if (s.size && !sizes.includes(s.size)) {
          sizes.push(s.size)
        }
      }
    }

    const flashDealPriceNum = body.flashDealPrice ? Number(body.flashDealPrice) : undefined

    const result = await productService.create({
      name: body.name,
      description: body.description || '',
      price: Number(body.price),
      categoryId: String(body.categoryId),
      brandId: body.brandId ? String(body.brandId) : undefined,
      sku: body.sku ? String(body.sku) : undefined,
      stock: body.stock ? Number(body.stock) : 0,
      rating: 0,
      traderId,
      images,
      sizes,
      colors,
      isMustHave: body.isMustHave === 'true' || body.isMustHave === true,
      isFlashDeals: body.isFlashDeals === 'true' || body.isFlashDeals === true,
      ...(flashDealPriceNum !== undefined && { flashDealPrice: flashDealPriceNum }),
      ...(body.flashDealEndsAt && { flashDealEndsAt: String(body.flashDealEndsAt) }),
    })

    successResponse(res, {
      statusCode: 201,
      message: 'Product created successfully',
      data: result,
    })
  }
)

export const addProductColor = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id)
    const productId = String(req.params.productId)
    const files = (req.files as Express.Multer.File[]) || []

    await getProductAndVerifyOwner(productId, traderId)

    const color = String(req.body.colorName || req.body.colorCode || '')

    await prisma.productColor.create({
      data: { color, productId },
    })

    for (const file of files) {
      await prisma.productImage.create({
        data: {
          url: buildImageUrl(req, file.filename),
          color,
          productId,
        },
      })
    }

    if (req.body.variants) {
      const variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants
      for (const v of variants) {
        await prisma.productSize.create({
          data: { size: String(v.size), productId },
        })
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id: productId },
      include: { colors: true, images: true, sizes: true, category: true, brand: true },
    })

    successResponse(res, {
      statusCode: 201,
      message: 'Color added successfully',
      data: updated,
    })
  }
)

export const deleteProductColor = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id)
    const colorId = String(req.params.colorId)

    const color = await prisma.productColor.findUnique({ where: { id: colorId } })
    if (!color) throw new AppError('Color not found', 404)
    await getProductAndVerifyOwner(color.productId, traderId)

    await prisma.productImage.deleteMany({
      where: { productId: color.productId, color: color.color },
    })
    await prisma.productColor.delete({ where: { id: colorId } })

    successResponse(res, { message: 'Color deleted successfully' })
  }
)

export const replaceProductColorImages = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id)
    const colorId = String(req.params.colorId)
    const files = (req.files as Express.Multer.File[]) || []

    const color = await prisma.productColor.findUnique({ where: { id: colorId } })
    if (!color) throw new AppError('Color not found', 404)
    await getProductAndVerifyOwner(color.productId, traderId)

    await prisma.productImage.deleteMany({
      where: { productId: color.productId, color: color.color },
    })

    for (const file of files) {
      await prisma.productImage.create({
        data: {
          url: buildImageUrl(req, file.filename),
          color: color.color,
          productId: color.productId,
        },
      })
    }

    const updated = await prisma.product.findUnique({
      where: { id: color.productId },
      include: { images: true, colors: true, sizes: true, category: true, brand: true },
    })

    successResponse(res, {
      message: 'Images replaced successfully',
      data: updated,
    })
  }
)

export const addProductColorImages = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id)
    const colorId = String(req.params.colorId)
    const files = (req.files as Express.Multer.File[]) || []

    const color = await prisma.productColor.findUnique({ where: { id: colorId } })
    if (!color) throw new AppError('Color not found', 404)
    await getProductAndVerifyOwner(color.productId, traderId)

    for (const file of files) {
      await prisma.productImage.create({
        data: {
          url: buildImageUrl(req, file.filename),
          color: color.color,
          productId: color.productId,
        },
      })
    }

    const updated = await prisma.product.findUnique({
      where: { id: color.productId },
      include: { images: true, colors: true, sizes: true, category: true, brand: true },
    })

    successResponse(res, {
      statusCode: 201,
      message: 'Images added successfully',
      data: updated,
    })
  }
)

export const deleteProductImage = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id)
    const imageId = String(req.params.imageId)

    const image = await prisma.productImage.findUnique({ where: { id: imageId } })
    if (!image) throw new AppError('Image not found', 404)
    await getProductAndVerifyOwner(image.productId, traderId)

    await prisma.productImage.delete({ where: { id: imageId } })

    successResponse(res, { message: 'Image deleted successfully' })
  }
)

export const updateProductVariant = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id)
    const variantId = String(req.params.variantId)
    const { quantity } = req.body

    const variant = await prisma.productSize.findUnique({ where: { id: variantId } })
    if (!variant) throw new AppError('Variant not found', 404)
    await getProductAndVerifyOwner(variant.productId, traderId)

    const updated = await prisma.product.update({
      where: { id: variant.productId },
      data: { stock: Number(quantity) },
      include: { sizes: true, colors: true, images: true, category: true, brand: true },
    })

    successResponse(res, {
      message: 'Variant updated successfully',
      data: updated,
    })
  }
)

export const addProductSize = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id)
    const colorId = String(req.params.colorId)
    const { size, quantity } = req.body

    const color = await prisma.productColor.findUnique({ where: { id: colorId } })
    if (!color) throw new AppError('Color not found', 404)
    await getProductAndVerifyOwner(color.productId, traderId)

    await prisma.productSize.create({
      data: { size: String(size), productId: color.productId },
    })

    if (quantity !== undefined) {
      await prisma.product.update({
        where: { id: color.productId },
        data: { stock: { increment: Number(quantity) } },
      })
    }

    const updated = await prisma.product.findUnique({
      where: { id: color.productId },
      include: { sizes: true, colors: true, images: true, category: true, brand: true },
    })

    successResponse(res, {
      statusCode: 201,
      message: 'Size added successfully',
      data: updated,
    })
  }
)

export const deleteProductVariant = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id)
    const variantId = String(req.params.variantId)

    const variant = await prisma.productSize.findUnique({ where: { id: variantId } })
    if (!variant) throw new AppError('Variant not found', 404)
    await getProductAndVerifyOwner(variant.productId, traderId)

    await prisma.productSize.delete({ where: { id: variantId } })

    successResponse(res, { message: 'Variant deleted successfully' })
  }
)
