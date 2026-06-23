import { Router } from 'express';
import { prisma } from '@quickkart/database';
import { requireAdmin, type AuthenticatedRequest } from '../../middleware/auth.js';

const router = Router();

router.use(requireAdmin);

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      totalUsers,
      totalProducts,
      totalCategories,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { total: true },
      }),
      prisma.user.count(),
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    res.json({
      overview: {
        totalOrders,
        todayOrders,
        totalRevenue: Number(totalRevenue._sum.total ?? 0),
        todayRevenue: Number(todayRevenue._sum.total ?? 0),
        totalUsers,
        totalProducts,
        totalCategories,
      },
      recentOrders,
      ordersByStatus: ordersByStatus.map((entry) => ({
        status: entry.status,
        count: entry._count,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
