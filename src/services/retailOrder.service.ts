import AppError from "../utils/AppError.util.js";
import { retailOrderRepository } from "../repositories/retailOrder.repository.js";

type RetailOrderStatus =
  | "PENDING"
  | "APPROVED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

const allowedStatuses: RetailOrderStatus[] = [
  "PENDING",
  "APPROVED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
];

class RetailOrderService {
  async createOrder(
    userId: number,
    data: {
      productId: number;
      idCardImage: string;
      startDate: Date;
      endDate: Date;
    },
  ) {
    const product = await retailOrderRepository.productExists(data.productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (product.stock <= 0) {
      throw new AppError("Product is not available", 400);
    }

    return retailOrderRepository.create({
      userId,

      productId: data.productId,

      productPrice: product.price,

      depositAmount: product.depositAmount ?? 0,

      securityDeposit: product.securityDeposit ?? 0,

      idCardImage: data.idCardImage,

      startDate: data.startDate,

      endDate: data.endDate,
    });
  }

  async getMyOrders(userId: number) {
    return retailOrderRepository.findByUser(userId);
  }

  async getById(id: string, userId: number) {
    const order = await retailOrderRepository.findById(id);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.userId !== userId) {
      throw new AppError("Unauthorized", 403);
    }

    return order;
  }

  async payDeposit(id: string, paymentId?: string) {
    const order = await retailOrderRepository.findById(id);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    return retailOrderRepository.update(id, {
      depositPaid: true,
      paymentId,
    });
  }

  async getAll() {
    return retailOrderRepository.findAll();
  }

  async verifyId(id: string) {
    return retailOrderRepository.update(id, {
      idVerified: true,
    });
  }

  async updateStatus(id: string, status: RetailOrderStatus) {
    if (!allowedStatuses.includes(status)) {
      throw new AppError("Invalid order status", 400);
    }
    return retailOrderRepository.update(id, {
      status,
    });
  }
}
export const retailOrderService = new RetailOrderService();
