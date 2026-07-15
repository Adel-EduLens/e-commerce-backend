import { Request } from 'express'
import { traderDesignRepository } from '../repositories/trader.design.repository.js'

export const traderDesignService = {
  async uploadImage(file: Express.Multer.File, req: Request) {
    const result = await traderDesignRepository.uploadImage(file, req)
    return result
  },

  async getImages(page: number, limit: number) {
    const result = await traderDesignRepository.getImages(page, limit)
    return result
  },

  async vote(id: string) {
    const result = await traderDesignRepository.vote(id)
    return result
  },

  async deleteImage(id: string) {
    const result = await traderDesignRepository.deleteImage(id)
    return result
  },
}
