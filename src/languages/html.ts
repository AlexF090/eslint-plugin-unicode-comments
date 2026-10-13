import type { SourceContext } from '../core/source-context.ts';
import type { LanguageAdapter } from './language-adapter.ts';
import {
  mapElementsToRanges,
  readArray,
  readComments,
  readType,
} from './syntax-element.ts';

const tokenContexts: ReadonlyMap<string, SourceContext> = new Map([
  ['Text', 'text'],
  ['AttributeValue', 'string'],
  // Embedded scripts and styles are not parsed further; treat them as prose
  // so their strings are judged by the prose policy instead of the code one.
  ['ScriptTagContent', 'text'],
  ['StyleTagContent', 'text'],
]);

/** `@html-eslint/eslint-plugin`. Tag and attribute names are code. */
export const htmlAdapter: LanguageAdapter = {
  name: 'HTML',
  defaultContext: 'code',
  matches: (ast) =>
    readType(ast) === 'Program' &&
    readType(readArray(ast, 'body')[0]) === 'Document',
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
