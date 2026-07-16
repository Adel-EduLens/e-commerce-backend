import { traderFAQRepository } from '../repositories/trader.faq.repository.js'
import AppError from '../utils/AppError.util.js'

export const traderFAQService = {
  async createFAQ(question: string, answer: string) {
    return traderFAQRepository.create(question, answer)
  },

  async getFAQs() {
    return traderFAQRepository.findAll()
  },

  async updateFAQ(id: number, question: string, answer: string) {
    const exists = await traderFAQRepository.findById(id)
    if (!exists) throw new AppError('Question not found', 404)
    return traderFAQRepository.update(id, question, answer)
  },

  async deleteFAQ(id: number) {
    const exists = await traderFAQRepository.findById(id)
    if (!exists) throw new AppError('Question not found', 404)
    return traderFAQRepository.delete(id)
  },
}
