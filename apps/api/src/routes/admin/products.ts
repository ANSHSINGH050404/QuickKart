import { Router } from 'express';
import { prisma } from '@quickkart/database';
import { requireAdmin, type AuthenticatedRequest } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { productSchema } from '../../lib/validation.js';

const router = Router();

router.use(requireAdmin);

router.post('/', validate(productSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const product = await prisma.product.create({
      data: req.body,
      include: {
        category: { select: { name: true } },
      },
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validate(productSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const product = await prisma.product.update({
      where: { id },
      data: req.body,
      include: {
        category: { select: { name: true } },
      },
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
