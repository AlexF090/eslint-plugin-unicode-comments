import type { SourceContext } from '../core/source-context.ts';
import type { LanguageAdapter } from './language-adapter.ts';
import {
  isRecord,
  mapElementsToRanges,
  readArray,
  readComments,
  readType,
} from './syntax-element.ts';

const tokenContexts: ReadonlyMap<string, SourceContext> = new Map([
  ['String', 'string'],
  ['Template', 'string'],
  ['RegularExpression', 'string'],
  ['JSXText', 'text'],
  ['Identifier', 'identifier'],
  ['Keyword', 'identifier'],
  ['PrivateIdentifier', 'identifier'],
  ['JSXIdentifier', 'identifier'],
  ['Boolean', 'identifier'],
  ['Null', 'identifier'],
]);

/** JavaScript, TypeScript, and JSX via espree or typescript-eslint, plus other parsers producing ESTree tokens. */
export const javascriptAdapter: LanguageAdapter = {
  name: 'JavaScript',
  defaultContext: 'code',
  matches: (ast) =>
    readType(ast) === 'Program' &&
    isRecord(ast) &&
    Array.isArray(ast['tokens']),
  collectContextRanges: (sourceCode) => [
    ...mapElementsToRanges(readArray(sourceCode.ast, 'tokens'), (type) =>
      tokenContexts.get(type),
    ),
    ...mapElementsToRanges(
      readComments(sourceCode, sourceCode.ast),
      () => 'comment',
    ),
  ],
};
