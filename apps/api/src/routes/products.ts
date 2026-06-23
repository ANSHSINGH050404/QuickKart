import { Router } from 'express';
import { prisma } from '@quickkart/database';
import { paginationSchema, paginatedResponse } from '../lib/pagination.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const pagination = paginationSchema.parse(req.query);
    const categoryId = req.query.categoryId as string | undefined;
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as 'asc' | 'desc') || 'desc';

    const where = {
      isAvailable: true,
      ...(categoryId ? { categoryId } : {}),
    };

    const orderBy = ['price', 'rating', 'name'].includes(sort)
      ? { [sort]: order }
      : { createdAt: 'desc' as const };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy,
        include: {
          images: true,
          category: { select: { id: true, name: true, slug: true } },
          inventory: { select: { quantity: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json(paginatedResponse(products, total, pagination));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        images: true,
        category: { select: { id: true, name: true, slug: true } },
        inventory: { select: { quantity: true } },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

export default router;
