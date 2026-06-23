import { Server as HTTPServer } from 'node:http';
import { Server } from 'socket.io';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '@quickkart/auth';
import { prisma } from '@quickkart/database';

export function createSocketIO(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(socket.request.headers as Record<string, string | string[] | undefined>),
      });

      if (!session?.user) {
        next(new Error('Unauthorized'));
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true },
      });

      if (!user) {
        next(new Error('User not found'));
        return;
      }

      socket.data.userId = user.id;
      socket.data.userRole = user.role;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.userId}`);

    socket.join(`user:${socket.data.userId}`);

    if (socket.data.userRole === 'ADMIN') {
      socket.join('admin');
    }

    socket.on('track:order', (orderId: string) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('partner:location', (data: { lat: number; lng: number }) => {
      io.to('admin').emit('partner:location:update', {
        partnerId: socket.data.userId,
        lat: data.lat,
        lng: data.lng,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.userId}`);
    });
  });

  return io;
}
