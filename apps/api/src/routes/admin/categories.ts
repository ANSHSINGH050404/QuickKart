import { Router } from 'express';
import { prisma } from '@quickkart/database';
import { requireAdmin, type AuthenticatedRequest } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { categorySchema } from '../../lib/validation.js';

const router = Router();

router.use(requireAdmin);

router.post('/', validate(categorySchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const category = await prisma.category.create({
      data: req.body,
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validate(categorySchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const category = await prisma.category.update({
      where: { id },
      data: req.body,
    });

    res.json(category);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
