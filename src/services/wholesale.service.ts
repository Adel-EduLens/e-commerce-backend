import AppError from "../utils/AppError.util.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { wholesaleRepository } from "../repositories/wholesale.repository.js";
import { WholesaleCreateData, WholesaleUpdateData } from "../types/wholesale.types.js";
import { traderProfileRepository } from "../repositories/traderProfile.repository.js";
import { notificationRepository } from "../repositories/notification.repository.js";

export const wholesaleService = {
  async create(data: WholesaleCreateData) {
    const trader = await traderProfileRepository.findById(data.traderId);
    if (!trader) {
      throw new AppError("Trader not found", 404);
    }

    const category = await categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new AppError("Category not found", 404);
    }

    const wholesale = await wholesaleRepository.create({ ...data });

    // Notify category subscribers
    const subscribers = await notificationRepository.getSubscribersForCategory(data.categoryId);
    if (subscribers.length > 0) {
      await notificationRepository.createMany(
        subscribers.map((s) => ({
          userId: s.userId,
          title: 'New wholesale item in your collection',
          body: `"${wholesale.name}" was just added to a wholesale collection you follow.`,
          imageUrl: (wholesale as any).images?.[0]?.url ?? undefined,
          productId: wholesale.id,
          categoryId: data.categoryId,
        }))
      );
    }

    return wholesale;
  },

  async getAll(query: { search?: string | undefined; categoryId?: string | undefined; categoryName?: string | undefined; isBestDeal?: boolean | undefined; isMostPopular?: boolean | undefined; isPremiumCollection?: boolean | undefined }) {
    return wholesaleRepository.findAll(query);
  },

  async getByTraderId(traderId: number) {
    return wholesaleRepository.findByTraderId(traderId);
  },

  async getById(id: string) {
    const wholesale = await wholesaleRepository.findById(id);
    if (!wholesale) {
      throw new AppError("Wholesale product not found", 404);
    }
    return wholesale;
  },

  async update(id: string, data: WholesaleUpdateData) {
    const wholesale = await this.getById(id);

    if (data.traderId !== wholesale.traderId) {
      throw new AppError("You are not authorized to update this wholesale product", 403);
    }

    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new AppError("Category not found", 404);
      }
    }

    const oldStock = wholesale.stock;
    const updatedWholesale = await wholesaleRepository.update(id, data);
    const newStock = updatedWholesale.stock;

    if (oldStock <= 0 && newStock > 0) {
      await this.notifyRestockSubscribers(id, updatedWholesale.name, (updatedWholesale as any).images);
    }

    return updatedWholesale;
  },

  async notifyRestockSubscribers(productId: string, productName: string, images: any[]) {
    const prismaClient = (await import('../utils/prismaClient.js')).default;
    const subscribers = await prismaClient.notifyMeSubscription.findMany({
      where: { targetType: 'WHOLESALE_RESTOCK', targetId: productId, isActive: true },
    });
    if (subscribers.length === 0) return;
    const imageUrl = images?.[0]?.url || null;
    await prismaClient.userNotification.createMany({
      data: subscribers.map((sub) => ({
        userId: sub.userId,
        title: 'Wholesale Product Back in Stock!',
        message: `Great news! Wholesale item "${productName}" is now back in stock. Check it out!`,
        type: 'restock',
        productId,
        imageUrl,
      })),
    });
    await prismaClient.notifyMeSubscription.updateMany({
      where: { targetType: 'WHOLESALE_RESTOCK', targetId: productId, isActive: true },
      data: { isActive: false },
    });
  },

  async delete(id: string, traderId: number) {
    const wholesale = await this.getById(id);
    if (traderId !== wholesale.traderId) {
      throw new AppError("You are not authorized to delete this wholesale product", 403);
    }
    return wholesaleRepository.delete(id);
  },
};
