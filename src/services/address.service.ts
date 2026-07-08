import { addressRepository } from "../repositories/address.repository.js";
import AppError from "../utils/AppError.util.js";

export const addressService = {
  async addAddress(userId: number, data: any) {
    return addressRepository.create(userId, data);
  },

  async getMyAddresses(userId: number) {
    return addressRepository.findByUserId(userId);
  },

  async updateAddress(userId: number, addressId: string, data: any) {
    const address = await addressRepository.findById(addressId);

    if (!address || address.userId !== userId) {
      throw new AppError("Address not found", 404);
    }

    return addressRepository.update(addressId, data);
  },

  async deleteAddress(userId: number, addressId: string) {
    const address = await addressRepository.findById(addressId);

    if (!address || address.userId !== userId) {
      throw new AppError("Address not found", 404);
    }

    return addressRepository.delete(addressId);
  },
};
