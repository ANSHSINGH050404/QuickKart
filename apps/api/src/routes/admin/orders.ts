import { Router } from 'express';
import { prisma, type OrderStatus } from '@quickkart/database';
import { requireAdmin, type AuthenticatedRequest } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { orderStatusSchema } from '../../lib/validation.js';
import { paginationSchema, paginatedResponse } from '../../lib/pagination.js';

const router = Router();

router.use(requireAdmin);

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const pagination = paginationSchema.parse(req.query);
    const status = req.query.status as OrderStatus | undefined;

    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          items: {
            include: {
              product: { select: { name: true, image: true } },
            },
          },
          address: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    res.json(paginatedResponse(orders, total, pagination));
  } catch (error) {
    next(error);
  }
});

router.put('/:id/status', validate(orderStatusSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: req.body.status },
      include: {
        user: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`order:${updated.id}`).emit('order.status', {
        orderId: updated.id,
        status: updated.status,
      });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
