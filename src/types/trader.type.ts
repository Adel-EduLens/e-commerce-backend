import type { Document, Types } from 'mongoose';

export interface ITraderProfile extends Document {
  user: Types.ObjectId;
  storeName: string;
  storeDescription?: string;
  businessLicense?: string;
  bankName?: string;
  bankAccountNumber?: string;
  rating: number;
  totalSales: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
