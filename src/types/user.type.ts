import type { Request } from 'express'

export interface IUser {
  id: number
  name: string | null
  email: string
  password?: string
  role: string
  phone?: string | null
  status?: string
  createdAt: Date
}

export interface IUserResponse {
  id: number
  name: string | null
  email: string
  role: string
  phone?: string | null
  status?: string
  createdAt: Date
}

export interface AuthenticatedRequest extends Request {
  user?: { id: number; role: 'user' | 'trader' | 'admin' }
}
