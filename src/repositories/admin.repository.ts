import prisma from '../utils/prismaClient.js'
import AppError from '../utils/AppError.util.js'

class AdminRepository {

  async addQuestion(question: string, answer: string) {
    return prisma.frequentlyAskedQuestion.create({ data: { question, answer } })
  }

  async getQuestions() {
    return prisma.frequentlyAskedQuestion.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        question: true,
        answer: true,
        createdAt: true,
      },
    })
  }

  async deleteQuestion(id: number) {
    const exists = await prisma.frequentlyAskedQuestion.findUnique({ where: { id } })
    if (!exists) throw new AppError('Question not found', 404)
    return prisma.frequentlyAskedQuestion.delete({ where: { id } })
  }

  async updateQuestion(id: number, question: string, answer: string) {
    const exists = await prisma.frequentlyAskedQuestion.findUnique({ where: { id } })
    if (!exists) throw new AppError('Question not found', 404)
    return prisma.frequentlyAskedQuestion.update({
      where: { id },
      data: { question, answer },
    })
  }

  async getAllUsers() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })
  }

  async changeStatus(userId: number, status: 'active' | 'suspended') {
    const exists = await prisma.user.findUnique({ where: { id: userId } })
    if (!exists) throw new AppError('User not found', 404)
    return prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })
  }

  async findByEmail(email: string) {
    return prisma.admin.findFirst({ where: { email } })
  }
  async findById(id: number, select?: any) {
    return prisma.admin.findUnique({ where: { id }, ...(select && { select }) })
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

export const adminRepository = new AdminRepository()
