import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { AppError } from './errorHandler.js';

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }

  next();
};
