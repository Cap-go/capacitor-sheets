import angular from '@analogjs/vite-plugin-angular';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));
const source = (path: string): string => fileURLToPath(new URL(`../../src/${path}`, import.meta.url));

export default defineConfig({
  root,
  resolve: {
    mainFields: ['module'],
    alias: {
      '@capgo/capacitor-sheets/angular': source('angular/index.ts'),
      '@capgo/capacitor-sheets': source('index.ts'),
    },
  },
  plugins: [angular()],
});
