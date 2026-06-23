import type { Config } from 'tailwindcss';
import sharedConfig from '@quickkart/ui/tailwind.config';

const config: Config = {
  presets: [sharedConfig],
  content: [
    './app/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};

export default config;
