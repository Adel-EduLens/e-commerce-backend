import type { Document } from 'mongoose'
import type { Request } from 'express'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'user' | 'trader'
  phone?: string | undefined
  createdAt: Date
  updatedAt: Date
  comparePassword(password: string): Promise<boolean>
}

export interface IUserResponse {
  _id: string
  name: string
  email: string
  role: 'user' | 'trader'
  phone?: string | undefined
  createdAt: Date
  updatedAt: Date
}

export interface AuthenticatedRequest extends Request {
  user?: IUserResponse
}
