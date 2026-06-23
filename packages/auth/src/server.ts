import { betterAuth } from 'better-auth';
import { prisma } from '@quickkart/database';

export const auth = betterAuth({
  database: prisma,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
  },
});
