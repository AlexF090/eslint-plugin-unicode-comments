import type { LanguageAdapter } from './language-adapter.ts';
import { readType } from './syntax-element.ts';

/** `@eslint/markdown`. The whole document, including code blocks, is prose. */
export const markdownAdapter: LanguageAdapter = {
  name: 'Markdown',
  defaultContext: 'text',
  matches: (ast) => readType(ast) === 'root',
  collectContextRanges: () => [],
};

/** The plugin's own `text` language and any language this plugin does not recognise. */
export const plainTextAdapter: LanguageAdapter = {
  name: 'plain text',
  defaultContext: 'text',
  matches: () => true,
  collectContextRanges: () => [],
};
