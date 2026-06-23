import nextConfig from '@quickkart/eslint-config/next';

export default [
  ...nextConfig,
  {
    ignores: ['.next/**'],
  },
];
