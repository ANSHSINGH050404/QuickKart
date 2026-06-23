import { Router } from 'express';
import { prisma } from '@quickkart/database';
import { paginationSchema, paginatedResponse } from '../lib/pagination.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const pagination = paginationSchema.parse(req.query);
    const parentId = req.query.parentId as string | undefined;

    const where = parentId ? { parentId } : { parentId: null };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        include: {
          _count: { select: { products: true, children: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.category.count({ where }),
    ]);

    res.json(paginatedResponse(categories, total, pagination));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/products', async (req, res, next) => {
  try {
    const pagination = paginationSchema.parse(req.query);
    const where = { categoryId: req.params.id };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        include: {
          images: true,
          category: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json(paginatedResponse(products, total, pagination));
  } catch (error) {
    next(error);
  }
});

export default router;
