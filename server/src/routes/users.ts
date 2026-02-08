import { Router, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../services/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Validation helper
const validate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,
    });
  }
  next();
};

// GET /api/users/profile - Get current user profile
router.get(
  '/profile',
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
          createdAt: true,
          _count: {
            select: {
              hostedGames: true,
              rsvps: { where: { status: 'confirmed' } },
            },
          },
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: {
          ...user,
          gamesHosted: user._count.hostedGames,
          gamesJoined: user._count.rsvps,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/users/profile - Update user profile
router.patch(
  '/profile',
  authenticate,
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('phone').optional().matches(/^(\+977)?9[78]\d{8}$/).withMessage('Invalid Nepal phone number'),
    body('preferredSports').optional().isArray(),
    body('preferredSports.*').optional().isIn(['football', 'cricket', 'basketball', 'volleyball', 'badminton']),
    body('skillLevels').optional().isObject(),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      let { name, phone, preferredSports, skillLevels } = req.body;

      // Normalize phone number if provided
      if (phone && !phone.startsWith('+977')) {
        phone = '+977' + phone;
      }

      const user = await prisma.user.update({
        where: { id: req.userId },
        data: {
          ...(name && { name }),
          ...(phone !== undefined && { phone }),
          ...(preferredSports && { preferredSports }),
          ...(skillLevels && { skillLevels }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          preferredSports: true,
          skillLevels: true,
        },
      });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/users/push-token - Register push notification token
router.post(
  '/push-token',
  authenticate,
  [body('token').notEmpty().withMessage('Push token is required')],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      await prisma.user.update({
        where: { id: req.userId },
        data: { expoPushToken: token },
      });

      res.json({
        success: true,
        message: 'Push token registered',
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/:id - Get user public profile
router.get(
  '/:id',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          avatar: true,
          preferredSports: true,
          createdAt: true,
          _count: {
            select: {
              hostedGames: true,
              rsvps: { where: { status: 'confirmed' } },
            },
          },
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: {
          ...user,
          gamesHosted: user._count.hostedGames,
          gamesJoined: user._count.rsvps,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
