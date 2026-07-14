import { collectionRepository } from "../repositories/collection.repository.js";
import AppError from "../utils/AppError.util.js";

interface CreateCollectionData {
  name: string;
  description?: string;
  image: string;
  appearOnHome?: boolean;
  productIds?: string[];
}

interface UpdateCollectionData {
  name?: string;
  description?: string;
  image?: string;
  appearOnHome?: boolean;
  productIds?: string[];
}

export const collectionService = {
  async create(data: CreateCollectionData) {
    const exist = await collectionRepository.findByName(data.name);
    if (exist) {
      throw new AppError("Collection already exists with this name", 409);
    }
    if (data.appearOnHome) {
      const homeCollections = await collectionRepository.findAll(true);
      if (homeCollections.length >= 3) {
        throw new AppError("You can only have 3 collections appear on the home page", 400);
      }
    }
    return collectionRepository.create(data);
  },

  async getAll(appearOnHome?: boolean) {
    return collectionRepository.findAll(appearOnHome);
  },

  async getById(id: string) {
    const collection = await collectionRepository.findById(id);
    if (!collection) {
      throw new AppError("Collection not found", 404);
    }
    return collection;
  },

  async update(id: string, data: UpdateCollectionData) {
    const exist = await this.getById(id);
    if (data.name) {
      const nameExist = await collectionRepository.findByName(data.name);
      if (nameExist && nameExist.id !== id) {
        throw new AppError("Collection already exists with this name", 409);
      }
    }
    // Enforce max 3 home collections — only check if turning ON a collection that wasn't already ON
    if (data.appearOnHome === true && !exist.appearOnHome) {
      const homeCollections = await collectionRepository.findAll(true);
      if (homeCollections.length >= 3) {
        throw new AppError("You can only have 3 collections appear on the home page", 400);
      }
    }
    return collectionRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return collectionRepository.delete(id);
  },
};
