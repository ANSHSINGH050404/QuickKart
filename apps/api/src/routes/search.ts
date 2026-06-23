import { Router } from 'express';
import { prisma } from '@quickkart/database';
import { paginationSchema, paginatedResponse } from '../lib/pagination.js';
import { z } from 'zod';

const router = Router();

const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
});

router.get('/', async (req, res, next) => {
  try {
    const { q } = searchSchema.parse(req.query);
    const pagination = paginationSchema.parse(req.query);

    const where = {
      isAvailable: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } },
        { category: { name: { contains: q, mode: 'insensitive' as const } } },
      ],
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        include: {
          images: true,
          category: { select: { name: true, slug: true } },
        },
        orderBy: { rating: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json(paginatedResponse(products, total, pagination));
  } catch (error) {
    next(error);
  }
});

export default router;
