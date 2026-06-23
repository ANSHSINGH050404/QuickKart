import baseConfig from '@quickkart/eslint-config/base';

export default [
  ...baseConfig,
  {
    ignores: ['dist/**'],
  },
];
