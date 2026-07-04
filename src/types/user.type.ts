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
  id: number
  name: string | null
  email: string
  role: string
  phone?: string | null
  avatar?: string | null
  dateOfBirth?: Date | null
  gender?: string | null
  createdAt: Date
  updatedAt: Date
  status?: string
}

export interface AuthenticatedRequest extends Request {
  user?: IUserResponse
}
