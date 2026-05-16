import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';

const rootDir = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: rootDir,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'examples/**'],
  },
  ...compat.extends('@ionic/eslint-config/recommended'),
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs', '*.config.ts', 'scripts/*.ts'],
        },
        tsconfigRootDir: rootDir,
      },
    },
  },
  {
    files: ['eslint.config.mjs'],
    rules: {
      'import/order': 'off',
    },
  },
];
