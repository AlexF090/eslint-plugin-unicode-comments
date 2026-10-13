import type { LanguageAdapter } from './language-adapter.ts';
import {
  collectTokenAndCommentRanges,
  isProgramStartingWith,
} from './syntax-element.ts';

/** `eslint-plugin-toml`. Bare keys are identifiers, all four string kinds are strings. */
export const tomlAdapter: LanguageAdapter = {
  defaultContext: 'code',
  matches: (ast) =>
    isProgramStartingWith(ast, (type) => type.startsWith('TOML')),
  collectContextRanges: (sourceCode) =>
    collectTokenAndCommentRanges(sourceCode, (type) => {
      if (type === 'Bare') {
        return 'identifier';
      }
      return type.endsWith('String') ? 'string' : undefined;
    }),
};
