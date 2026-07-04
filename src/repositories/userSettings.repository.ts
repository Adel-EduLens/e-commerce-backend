import prisma from '../utils/prismaClient.js'

class UserSettingsRepository {
  async getOrCreateForUser(userId: number) {
    const existingSettings = await prisma.userSettings.findUnique({
      where: { userId },
    })

    if (existingSettings) {
      return existingSettings
    }

    return prisma.userSettings.create({
      data: {
        userId,
        language: 'en',
        currency: 'USD',
        darkMode: false,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        marketingEmails: false,
      },
    })
  }

  async updateForUser(userId: number, data: Record<string, any>) {
    return prisma.userSettings.update({
      where: { userId },
      data,
    })
  }
}

export const userSettingsRepository = new UserSettingsRepository()
