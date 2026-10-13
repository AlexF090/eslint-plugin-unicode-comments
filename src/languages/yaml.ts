import type { LanguageAdapter } from './language-adapter.ts';
import {
  collectCommentRanges,
  mapElementsToRanges,
  readArray,
  readType,
} from './syntax-element.ts';

const scalarTokenTypes = new Set([
  'Identifier',
  'String',
  'BlockLiteral',
  'BlockFolded',
]);

/** `eslint-plugin-yml`. Plain, quoted, and block scalars (keys included) are strings. */
export const yamlAdapter: LanguageAdapter = {
  name: 'YAML',
  defaultContext: 'code',
  matches: (ast) =>
    readType(ast) === 'Program' &&
    readType(readArray(ast, 'body')[0])?.startsWith('YAML') === true,
  collectContextRanges: (sourceCode) => [
    ...mapElementsToRanges(readArray(sourceCode.ast, 'tokens'), (type) =>
      scalarTokenTypes.has(type) ? 'string' : undefined,
    ),
    ...collectCommentRanges(sourceCode),
  ],
};
