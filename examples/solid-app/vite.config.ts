import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

const source = (path: string): string => fileURLToPath(new URL(`../../src/${path}`, import.meta.url));

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      '@capgo/capacitor-sheets/solid': source('solid/index.ts'),
      '@capgo/capacitor-sheets': source('index.ts'),
    },
  },
});
