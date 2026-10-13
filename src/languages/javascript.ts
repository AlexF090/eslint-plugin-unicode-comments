import type { SourceContext } from '../core/source-context.ts';
import type { LanguageAdapter } from './language-adapter.ts';
import { isRecord } from '../core/is-record.ts';
import { collectTokenAndCommentRanges, readType } from './syntax-element.ts';

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
  defaultContext: 'code',
  fixesCode: true,
  matches: (ast) =>
    readType(ast) === 'Program' &&
    isRecord(ast) &&
    Array.isArray(ast['tokens']),
  collectContextRanges: (sourceCode) =>
    collectTokenAndCommentRanges(sourceCode, (type) => tokenContexts.get(type)),
};
