import { Router } from 'express';
import { prisma } from '@quickkart/database';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addressSchema } from '../lib/validation.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.userId! },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    res.json(addresses);
  } catch (error) {
    next(error);
  }
});

router.post('/', validate(addressSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.body.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.userId!, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...req.body,
        userId: req.userId!,
      },
    });

    res.status(201).json(address);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validate(addressSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.address.findFirst({
      where: { id, userId: req.userId! },
    });

    if (!existing) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    if (req.body.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.userId!, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: req.body,
    });

    res.json(address);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.address.findFirst({
      where: { id, userId: req.userId! },
    });

    if (!existing) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    await prisma.address.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
