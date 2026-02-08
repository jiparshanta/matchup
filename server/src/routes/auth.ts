import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../services/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Validation helper
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,
    });
  }
  next();
};

// Generate tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// Demo account for testing
const DEMO_EMAIL = 'demo@matchup.com';
const DEMO_PASSWORD = 'demo123456';

// POST /api/auth/signup
router.post(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('name')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be 2-50 characters'),
    body('phone')
      .optional()
      .matches(/^(\+977)?9[78]\d{8}$/)
      .withMessage('Invalid Nepal phone number (optional)'),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name, phone } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new AppError('An account with this email already exists', 400);
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Normalize phone number if provided
      let normalizedPhone = phone;
      if (phone && !phone.startsWith('+977')) {
        normalizedPhone = '+977' + phone;
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          phone: normalizedPhone || null,
          isVerified: true, // For now, auto-verify (can add email verification later)
        },
      });

      // Generate tokens
      const tokens = generateTokens(user.id);

      // Store refresh token
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            preferredSports: user.preferredSports,
            skillLevels: user.skillLevels,
            role: user.role,
          },
          tokens,
          isNewUser: true,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // Check if user is banned
      if (user.isBanned) {
        throw new AppError('Your account has been suspended', 403);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      // Generate tokens
      const tokens = generateTokens(user.id);

      // Store refresh token
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      // Check if profile is complete (has preferred sports)
      const isProfileComplete = user.preferredSports.length > 0;

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            preferredSports: user.preferredSports,
            skillLevels: user.skillLevels,
            role: user.role,
          },
          tokens,
          isNewUser: !isProfileComplete,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
      ) as { userId: string };

      // Find user and verify refresh token matches
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Generate new tokens
      const tokens = generateTokens(user.id);

      // Update refresh token
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      res.json({
        success: true,
        data: { tokens },
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError('Invalid refresh token', 401));
      }
      next(error);
    }
  }
);

// POST /api/auth/logout
router.post(
  '/logout',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Clear refresh token
      await prisma.user.update({
        where: { id: req.userId },
        data: { refreshToken: null },
      });

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/auth/me
router.get(
  '/me',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          preferredSports: true,
          skillLevels: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
