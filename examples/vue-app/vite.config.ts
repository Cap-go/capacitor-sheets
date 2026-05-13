import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const source = (path: string): string => fileURLToPath(new URL(`../../src/${path}`, import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@capgo/capacitor-sheets/vue': source('vue/index.ts'),
      '@capgo/capacitor-sheets': source('index.ts'),
    },
  },
});
