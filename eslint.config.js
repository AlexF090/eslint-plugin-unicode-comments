import json from '@eslint/json';
import markdown from '@eslint/markdown';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import regexpPlugin from 'eslint-plugin-regexp';
import yml from 'eslint-plugin-yml';
import tseslint from 'typescript-eslint';
import unicodeGuard from './src/index.ts';

export default defineConfig(
  {
    ignores: ['dist/**', 'coverage/**', 'package-lock.json'],
  },
  {
    files: ['**/*.{js,ts}'],
    extends: [
      tseslint.configs.recommended,
      regexpPlugin.configs['flat/recommended'],
      unicodeGuard.configs.recommended,
      eslintConfigPrettier,
    ],
  },
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: [unicodeGuard.configs.recommended],
  },
  {
    files: ['**/*.md'],
    plugins: { markdown },
    language: 'markdown/gfm',
    extends: [unicodeGuard.configs.recommended],
  },
  {
    files: ['**/*.{yml,yaml}'],
    plugins: { yml },
    language: 'yml/yaml',
    extends: [unicodeGuard.configs.recommended],
  },
  unicodeGuard.configs['ai-instructions'],
);
