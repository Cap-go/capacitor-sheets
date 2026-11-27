import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
  },
  {
    entry: ['src/react/index.ts'],
    outDir: 'dist/react',
    format: ['esm'],
    dts: true,
    sourcemap: true,
    external: ['react', 'react-dom'],
  },
  {
    entry: ['src/vue/index.ts'],
    outDir: 'dist/vue',
    format: ['esm'],
    dts: true,
    sourcemap: true,
    external: ['vue'],
  },
  {
    entry: ['src/angular/index.ts'],
    outDir: 'dist/angular',
    format: ['esm'],
    dts: true,
    sourcemap: true,
    external: ['@angular/core'],
  },
  {
    entry: ['src/svelte/index.ts'],
    outDir: 'dist/svelte',
    format: ['esm'],
    dts: true,
    sourcemap: true,
    external: ['svelte'],
  },
  {
    entry: ['src/solid/index.ts'],
    outDir: 'dist/solid',
    format: ['esm'],
    dts: true,
    sourcemap: true,
    external: ['solid-js'],
  },
]);
