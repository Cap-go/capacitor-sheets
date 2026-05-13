import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const source = (path: string): string => fileURLToPath(new URL(`../../src/${path}`, import.meta.url));

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '@capgo/capacitor-sheets/svelte': source('svelte/index.ts'),
      '@capgo/capacitor-sheets': source('index.ts'),
    },
  },
});
