import type { SourceContext } from '../core/source-context.ts';
import type { LanguageAdapter } from './language-adapter.ts';
import {
  collectTokenAndCommentRanges,
  isProgramStartingWith,
} from './syntax-element.ts';

const tokenContexts: ReadonlyMap<string, SourceContext> = new Map([
  ['Text', 'text'],
  ['AttributeValue', 'string'],
  // Embedded scripts and styles are not parsed further. As strings they get
  // the string policy and only suggestions, so no fix can break their code.
  ['ScriptTagContent', 'string'],
  ['StyleTagContent', 'string'],
]);

/** `@html-eslint/eslint-plugin`. Tag and attribute names are code. */
export const htmlAdapter: LanguageAdapter = {
  defaultContext: 'code',
  matches: (ast) => isProgramStartingWith(ast, (type) => type === 'Document'),
  collectContextRanges: (sourceCode) =>
    collectTokenAndCommentRanges(sourceCode, (type) => tokenContexts.get(type)),
};
