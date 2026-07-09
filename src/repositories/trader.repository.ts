import prisma from '../utils/prismaClient.js'
import AppError from '../utils/AppError.util.js'

class TraderRepository {

  findByEmail(email: string) {
    return prisma.trader.findUnique({
      where: { email },
    })
  }

  findById(id: number) {
    return prisma.trader.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, address: true, role: true, createdAt: true },
    })
  }

  updateById(id: number, data: { name?: string; address?: string }) {
    return prisma.trader.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, phone: true, address: true, role: true, createdAt: true },
    })
  }

  async addvideo(title: string, category: string, youtubeId: string) {
    return prisma.helpCenterVideo.create({
      data: { title, category, youtubeId },
    })
  }

  async getVideos() {
    return prisma.helpCenterVideo.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        youtubeId: true,
        createdAt: true,
      },
    })
  }

  async updateVideo(
    id: string,
    title: string,
    category: string,
    youtubeId: string
  ) {
    const exists = await prisma.helpCenterVideo.findUnique({ where: { id } })
    if (!exists) throw new AppError('Video not found', 404)
    return prisma.helpCenterVideo.update({
      where: { id },
      data: { title, category, youtubeId },
    })
  }

  async deleteVideo(id: string) {
    const exists = await prisma.helpCenterVideo.findUnique({ where: { id } })
    if (!exists) throw new AppError('Video not found', 404)
    return prisma.helpCenterVideo.delete({ where: { id } })
  }

  async getHelpCenterCategories() {
    return prisma.helpCenterCategory.findMany()
  }

  async addHelpCenterCategory(name: string) {
    const exists = await prisma.helpCenterCategory.findUnique({ where: { name } })
    if (exists) throw new AppError('Category already exists', 400)
    return prisma.helpCenterCategory.create({
      data: { name }
    })
  }

  async deleteHelpCenterCategory(id: string) {
    const exists = await prisma.helpCenterCategory.findUnique({ where: { id } })
    if (!exists) throw new AppError('Category not found', 404)
    return prisma.helpCenterCategory.delete({ where: { id } })
  }
}

export const traderRepository = new TraderRepository()
