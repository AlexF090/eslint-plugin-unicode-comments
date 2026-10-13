import type { LanguageAdapter } from './language-adapter.ts';
import {
  collectCommentRanges,
  mapElementsToRanges,
  readArray,
  readType,
} from './syntax-element.ts';

/** `eslint-plugin-toml`. Bare keys are identifiers, all four string kinds are strings. */
export const tomlAdapter: LanguageAdapter = {
  name: 'TOML',
  defaultContext: 'code',
  matches: (ast) =>
    readType(ast) === 'Program' &&
    readType(readArray(ast, 'body')[0])?.startsWith('TOML') === true,
  collectContextRanges: (sourceCode) => [
    ...mapElementsToRanges(readArray(sourceCode.ast, 'tokens'), (type) => {
      if (type === 'Bare') {
        return 'identifier';
      }
      return type.endsWith('String') ? 'string' : undefined;
    }),
    ...collectCommentRanges(sourceCode),
  ],
};
