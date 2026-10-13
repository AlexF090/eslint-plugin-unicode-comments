import type { ContextRange, SourceContext } from '../core/source-context.ts';
import type { LanguageAdapter } from './language-adapter.ts';
import { isRecord } from '../core/is-record.ts';
import {
  collectTokenAndCommentRanges,
  readArray,
  readOffsets,
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

const nonWhitespacePattern = /\S/u;

const holdsMoreThanWhitespaceAndComments = (
  text: string,
  comments: readonly ContextRange[],
  start: number,
  end: number,
): boolean => {
  let position = start;
  for (const comment of comments) {
    if (comment.end <= start || comment.start >= end) {
      continue;
    }
    if (nonWhitespacePattern.test(text.slice(position, comment.start))) {
      return true;
    }
    position = Math.max(position, comment.end);
  }
  return nonWhitespacePattern.test(text.slice(position, end));
};

/**
 * Text before the first and after the last token is `text` when it holds
 * more than whitespace and comments: parsers of single-file components such
 * as Vue and Svelte return only the tokens of the script block, and the
 * markup around it must not be treated, or autofixed, as JavaScript code.
 */
const collectMarkupAroundTokens = (
  text: string,
  tokens: readonly unknown[],
  comments: readonly ContextRange[],
): ContextRange[] => {
  const firstTokenStart = readOffsets(tokens[0])?.[0] ?? text.length;
  const lastTokenEnd = readOffsets(tokens.at(-1))?.[1] ?? firstTokenStart;
  const regions: ContextRange[] = [
    { start: 0, end: firstTokenStart, context: 'text' },
    { start: lastTokenEnd, end: text.length, context: 'text' },
  ];
  return regions.filter((region) =>
    holdsMoreThanWhitespaceAndComments(
      text,
      comments,
      region.start,
      region.end,
    ),
  );
};

/** JavaScript, TypeScript, and JSX via espree or typescript-eslint, plus other parsers producing ESTree tokens. */
export const javascriptAdapter: LanguageAdapter = {
  defaultContext: 'code',
  fixesCode: true,
  matches: (ast) =>
    readType(ast) === 'Program' &&
    isRecord(ast) &&
    Array.isArray(ast['tokens']),
  collectContextRanges: (sourceCode) => {
    const tokenRanges = collectTokenAndCommentRanges(sourceCode, (type) =>
      tokenContexts.get(type),
    );
    const commentRanges = tokenRanges.filter(
      (range) => range.context === 'comment',
    );
    return [
      ...collectMarkupAroundTokens(
        sourceCode.text,
        readArray(sourceCode.ast, 'tokens'),
        commentRanges,
      ),
      ...tokenRanges,
    ];
  },
};
