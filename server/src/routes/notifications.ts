import { Router, Response, NextFunction } from 'express';
import { query, validationResult } from 'express-validator';
import { prisma } from '../services/prisma.js';
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

// GET /api/notifications - Get user notifications
router.get(
  '/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('unreadOnly').optional().isBoolean(),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20, unreadOnly } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: Record<string, unknown> = {
        userId: req.userId,
      };

      if (unreadOnly === 'true') {
        where.read = false;
      }

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({
          where: { userId: req.userId, read: false },
        }),
      ]);

      res.json({
        success: true,
        data: notifications,
        unreadCount,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/notifications/:id/read - Mark notification as read
router.post(
  '/:id/read',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await prisma.notification.updateMany({
        where: {
          id,
          userId: req.userId,
        },
        data: { read: true },
      });

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/notifications/read-all - Mark all notifications as read
router.post(
  '/read-all',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await prisma.notification.updateMany({
        where: {
          userId: req.userId,
          read: false,
        },
        data: { read: true },
      });

      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/notifications/unread-count - Get unread notification count
router.get(
  '/unread-count',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const count = await prisma.notification.count({
        where: {
          userId: req.userId,
          read: false,
        },
      });

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
