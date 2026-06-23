import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../types/user.type.js';
import { authService } from '../services/auth.service.js';
import { successResponse } from '../utils/response.util.js';
import { asyncHandler } from '../utils/globalErrorHandler.util.js';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.signup(req.body);

  successResponse(res, {
    statusCode: 201,
    message: 'User registered successfully',
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  successResponse(res, {
    statusCode: 200,
    message: 'Logged in successfully',
    data: result,
  });
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  successResponse(res, {
    statusCode: 200,
    data: { user: req.user },
  });
});
