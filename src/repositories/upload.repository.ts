import prisma from '../utils/prismaClient.js'
import { Request } from 'express'

class UploadRepository {
  async uploadImage(file: Express.Multer.File, req: Request) {
    return prisma.design.create({
      data: {
        imagePath: `${req.protocol}://${req.get('host')}/uploads/votes/${file.filename}`,
        title: req.body.title,
      },
    })
  }

  async getImages() {
    return prisma.design.findMany()
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
    return prisma.design.delete({
      where: {
        id,
      },
    })
  }
}

export const uploadRepository = new UploadRepository()
