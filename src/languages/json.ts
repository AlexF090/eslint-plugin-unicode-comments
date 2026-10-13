import type { LanguageAdapter } from './language-adapter.ts';
import { mapElementsToRanges, readArray, readType } from './syntax-element.ts';

/** `@eslint/json` (JSON, JSONC, JSON5). Keys and values are both string tokens. */
export const jsonAdapter: LanguageAdapter = {
  defaultContext: 'code',
  matches: (ast) =>
    readType(ast) === 'Document' && readArray(ast, 'tokens').length > 0,
  collectContextRanges: (sourceCode) =>
    mapElementsToRanges(readArray(sourceCode.ast, 'tokens'), (type) => {
      if (type === 'String') {
        return 'string';
      }
      return type.endsWith('Comment') ? 'comment' : undefined;
    }),
};
