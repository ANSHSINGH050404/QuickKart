import reactConfig from '@quickkart/eslint-config/react';

export default [
  ...reactConfig,
  {
    ignores: ['dist/**'],
  },
];
