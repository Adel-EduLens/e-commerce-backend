import AppError from '../utils/AppError.util.js'
import { userSettingsRepository } from '../repositories/userSettings.repository.js'

export const userSettingsService = {
  async getSettings(userId: number) {
    return userSettingsRepository.getOrCreateForUser(userId)
  },

  async updateSettings(userId: number, data: Record<string, any>) {
    const allowedFields = [
      'language',
      'currency',
      'darkMode',
      'emailNotifications',
      'pushNotifications',
      'smsNotifications',
      'marketingEmails',
    ]

    const payload: Record<string, any> = {}

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (field === 'darkMode' || field === 'emailNotifications' || field === 'pushNotifications' || field === 'smsNotifications' || field === 'marketingEmails') {
          if (typeof data[field] !== 'boolean') {
            throw new AppError(`${field} must be a boolean`, 400)
          }
          payload[field] = data[field]
        } else if (field === 'language' || field === 'currency') {
          if (typeof data[field] !== 'string' || data[field].trim().length < 1) {
            throw new AppError(`${field} must be a non-empty string`, 400)
          }
          payload[field] = data[field].trim()
        }
      }
    }

    if (Object.keys(payload).length === 0) {
      throw new AppError('No valid settings fields provided', 400)
    }

    return userSettingsRepository.updateForUser(userId, payload)
  },
}
