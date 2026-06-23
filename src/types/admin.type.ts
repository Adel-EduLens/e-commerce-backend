import type { Document } from 'mongoose';
import type { Request } from 'express';

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

export interface IAdminResponse {
  _id: string;
  name: string;
  email: string;
  role: 'admin';
  phone?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminAuthenticatedRequest extends Request {
  admin?: IAdminResponse;
}
