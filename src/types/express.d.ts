import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string | number;
        role: 'user' | 'trader' | 'admin';
      };
    }
  }
}