import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const source = (path: string): string => fileURLToPath(new URL(`../../src/${path}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@capgo/capacitor-sheets/react': source('react/index.ts'),
      '@capgo/capacitor-sheets': source('index.ts'),
    },
  },
});
