import { Request } from 'express'
import { uploadRepository } from '../repositories/upload.repository.js'

export const uploadService = {
  async uploadImage(file: Express.Multer.File, req: Request) {
    const result = await uploadRepository.uploadImage(file, req)
    return result
  },

  async getImages() {
    const result = await uploadRepository.getImages()
    return result
  },

  async vote(id: string) {
    const result = await uploadRepository.vote(id)
    return result
  },
  async deleteImage(id: string) {
    const result = await uploadRepository.deleteImage(id)
    return result
  },
}
