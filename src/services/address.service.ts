import { addressRepository } from "../repositories/address.repository.js";
import AppError from "../utils/AppError.util.js";

interface CreateAddressData {
  country: string;
  city: string;
  area: string;
  streetAddress: string;
  apartment?: string | null;
}
interface UpdateAddressData {
  country?: string;
  city?: string;
  area?: string;
  streetAddress?: string;
  apartment?: string | null;
}

export const addressService = {
  async addAddress(userId: number, data: CreateAddressData) {
    return addressRepository.create(userId, data);
  },

  async getMyAddresses(userId: number) {
    return addressRepository.findByUserId(userId);
  },

  async updateAddress(
    userId: number,
    addressId: string,
    data: UpdateAddressData,
  ) {
    const address = await addressRepository.findById(addressId);

    if (!address) {
      throw new AppError("Address not found", 404);
    }

    if (address.userId !== userId) {
      throw new AppError("You are not allowed to update this address", 403);
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
