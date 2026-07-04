import type { Document } from 'mongoose'
import type { Request } from 'express'

export interface IAdmin extends Document {
  name: string
  email: string
  password: string
  phone?: string | undefined
  createdAt: Date
  updatedAt: Date
  comparePassword(password: string): Promise<boolean>
}

export interface IAdminResponse {
  id: number
  name: string | null
  email: string
  role: string
  phone?: string | null
  createdAt: Date
}

export interface AdminAuthenticatedRequest extends Request {
  admin?: IAdminResponse
}
