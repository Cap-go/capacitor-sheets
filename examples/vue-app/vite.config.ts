import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));
const source = (path: string): string => fileURLToPath(new URL(`../../src/${path}`, import.meta.url));

export default defineConfig({
  root,
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('cap-'),
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@capgo/capacitor-sheets/vue': source('vue/index.ts'),
      '@capgo/capacitor-sheets': source('index.ts'),
    },
  },
});
