import { Router } from 'express';
import { prisma } from '@quickkart/database';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema } from '../lib/validation.js';
import { paginationSchema, paginatedResponse } from '../lib/pagination.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const pagination = paginationSchema.parse(req.query);

    const where = { userId: req.userId! };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        include: {
          items: {
            include: {
              product: {
                select: { name: true, image: true, unit: true },
              },
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

router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findFirst({
      where: { id, userId: req.userId! },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, image: true, unit: true, price: true },
            },
          },
        },
        address: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

router.post('/', validate(createOrderSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId! },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    const address = await prisma.address.findFirst({
      where: { id: req.body.addressId, userId: req.userId! },
    });

    if (!address) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.userId!,
          addressId: req.body.addressId,
          total,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, image: true, unit: true },
              },
            },
          },
          address: true,
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

export default router;
