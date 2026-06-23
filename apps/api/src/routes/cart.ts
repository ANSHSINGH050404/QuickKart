import { Router } from 'express';
import { prisma } from '@quickkart/database';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { cartItemSchema, cartItemUpdateSchema } from '../lib/validation.js';

const router = Router();

router.use(requireAuth);

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });
  }

  return cart;
}

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const cart = await getOrCreateCart(req.userId!);
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

router.post('/items', validate(cartItemSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const cart = await getOrCreateCart(req.userId!);
    const { productId, quantity } = req.body;

    const existingItem = cart.items.find((item) => item.productId === productId);

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: {
          product: {
            include: { images: true },
          },
        },
      });
      res.json(updated);
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isAvailable) {
      res.status(404).json({ error: 'Product not available' });
      return;
    }

    const item = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
      include: {
        product: {
          include: { images: true },
        },
      },
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.patch('/items/:id', validate(cartItemUpdateSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const item = await prisma.cartItem.findFirst({
      where: {
        id,
        cart: { userId: req.userId! },
      },
    });

    if (!item) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity: req.body.quantity },
      include: {
        product: {
          include: { images: true },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/items/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const item = await prisma.cartItem.findFirst({
      where: {
        id,
        cart: { userId: req.userId! },
      },
    });

    if (!item) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    await prisma.cartItem.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.delete('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId! },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
