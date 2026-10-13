import type { LanguageAdapter } from './language-adapter.ts';
import {
  collectTokenAndCommentRanges,
  isProgramStartingWith,
} from './syntax-element.ts';

const scalarTokenTypes = new Set([
  'Identifier',
  'String',
  'BlockLiteral',
  'BlockFolded',
]);

/** `eslint-plugin-yml`. Plain, quoted, and block scalars (keys included) are strings. */
export const yamlAdapter: LanguageAdapter = {
  defaultContext: 'code',
  matches: (ast) =>
    isProgramStartingWith(ast, (type) => type.startsWith('YAML')),
  collectContextRanges: (sourceCode) =>
    collectTokenAndCommentRanges(sourceCode, (type) =>
      scalarTokenTypes.has(type) ? 'string' : undefined,
    ),
};
