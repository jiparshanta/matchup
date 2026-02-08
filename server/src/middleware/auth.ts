import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../services/prisma.js';
import { AppError } from './errorHandler.js';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    phone?: string | null;
    role: 'user' | 'admin';
    isBanned: boolean;
  };
}

interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (user.isBanned) {
      throw new AppError('Your account has been banned', 403);
    }

    req.userId = user.id;
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expired', 401));
    }
    next(error);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
      },
    });

    if (user && !user.isBanned) {
      req.userId = user.id;
      req.user = user;
    }

    next();
  } catch {
    // Token invalid but optional, continue without auth
    next();
  }
};
