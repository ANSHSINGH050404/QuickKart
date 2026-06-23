import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@quickkart/ui', '@quickkart/auth'],
};

export default nextConfig;
