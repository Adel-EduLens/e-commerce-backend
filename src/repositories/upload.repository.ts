import prisma from '../utils/prismaClient.js'
import { Request } from 'express'
import fs from 'fs'
import path from 'path'

class UploadRepository {
  async uploadImage(file: Express.Multer.File, req: Request) {
    return prisma.design.create({
      data: {
        imagePath: `${req.protocol}://${req.get('host')}/uploads/votes/${file.filename}`,
        title: req.body.title,
      },
    })
  }

  async getImages(page = 1, limit = 16) {
    const total = await prisma.design.count()
    const images = await prisma.design.findMany({
      orderBy: { id: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return {
      images,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async vote(id: string) {
    return prisma.design.update({
      where: {
        id,
      },
      data: {
        votes: {
          increment: 1,
        },
      },
    })
  }
  async deleteImage(id: string) {
    const design = await prisma.design.findUnique({
      where: { id },
    })

    if (design && design.imagePath) {
      // imagePath format: protocol://host/uploads/votes/filename
      const parts = design.imagePath.split('/')
      const filename = parts[parts.length - 1] as string
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'votes', filename)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    return prisma.design.delete({
      where: {
        id,
      },
    })
  }
}

export const uploadRepository = new UploadRepository()
