import type { Finding } from '../core/scan-text.ts';
import type {
  Correction,
  CorrectionEnvironment,
} from './create-finding-rule.ts';

export const SUGGEST_REPLACEMENT_MESSAGE_ID = 'suggestReplacement';

export interface CorrectionOptions {
  /** Whether replacements in code are applied automatically. */
  fixesCode: boolean;
}

const lineBreakPattern = /[\n\r]/u;

/**
 * Characters that comment terminators are made of: an asterisk followed by
 * a slash ends block comments in JavaScript, CSS, and JSON with comments;
 * `-->` and `--!>` end HTML comments.
 */
const commentTerminatorCharacterPattern = /^[!*/>-]$/u;

const LAST_ASCII_CODE_POINT = 0x7f;

/** Characters that start Markdown inline HTML, links, images, and definitions. */
const markdownMarkupPattern = /[<[\]]/u;
const blankLinePattern = /\r?\n[\t ]*\r?\n/gu;

interface MarkdownBlock {
  start: number;
  end: number;
  containsMarkup: boolean;
}

/** Splits the text at blank lines into blocks in source order. */
const splitIntoBlocks = (sourceText: string): MarkdownBlock[] => {
  const blocks: MarkdownBlock[] = [];
  let start = 0;
  const addBlock = (end: number): void => {
    blocks.push({
      start,
      end,
      containsMarkup: markdownMarkupPattern.test(sourceText.slice(start, end)),
    });
  };
  for (const blankLine of sourceText.matchAll(blankLinePattern)) {
    addBlock(blankLine.index);
    start = blankLine.index + blankLine[0].length;
  }
  addBlock(sourceText.length);
  return blocks;
};

// Findings of one file are corrected one after another, so remembering the
// blocks of the last text keeps the check linear in the file length.
let lastSourceText: string | undefined;
let lastBlocks: MarkdownBlock[] = [];

/**
 * Whether the Markdown block (text between blank lines) around `offset`
 * contains `<`, `[`, or `]`. A lookalike quote or space there can be all
 * that keeps inline HTML, a link title, or a link reference definition from
 * parsing, so fixing it could turn inert prose into live markup.
 */
const isInBlockWithMarkup = (sourceText: string, offset: number): boolean => {
  if (sourceText !== lastSourceText) {
    lastSourceText = sourceText;
    lastBlocks = splitIntoBlocks(sourceText);
  }
  let low = 0;
  let high = lastBlocks.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const block = lastBlocks[middle];
    if (block === undefined) {
      return true;
    }
    if (offset < block.start) {
      high = middle - 1;
    } else if (offset >= block.end) {
      low = middle + 1;
    } else {
      return block.containsMarkup;
    }
  }
  return true;
};

/**
 * Whether `character` could be part of a comment terminator once fixes are
 * applied: a terminator character itself, or a non-ASCII character that
 * another fix in the same pass may turn into one.
 */
const mayFormCommentTerminator = (character: string | undefined): boolean => {
  if (character === undefined || character === '') {
    return false;
  }
  return (
    commentTerminatorCharacterPattern.test(character) ||
    (character.codePointAt(0) ?? 0) > LAST_ASCII_CODE_POINT
  );
};

/**
 * Whether replacing the finding with `replacement` joins two characters
 * that could form a comment terminator, such as `-` followed by the `->`
 * that replaces a rightwards arrow, which would end an HTML comment early
 * and turn the rest of it into live markup.
 */
const joinsCommentTerminator = (
  finding: Finding,
  replacement: string,
  sourceText: string,
): boolean => {
  const before = sourceText.at(finding.offset - 1);
  const after = sourceText.at(finding.offset + finding.length);
  const first = replacement.at(0);
  const last = replacement.at(-1);
  return (
    (mayFormCommentTerminator(before) && mayFormCommentTerminator(first)) ||
    (mayFormCommentTerminator(last) && mayFormCommentTerminator(after))
  );
};

/** Signs that a word is, or could become, a GFM email, www, or URL autolink. */
const autolinkSignPattern = /[:@]|www/iu;
const whitespacePattern = /\s/u;
// Words longer than this are treated as autolinks without scanning further.
const MAXIMUM_SCANNED_WORD_LENGTH = 512;

/**
 * Whether the whitespace-delimited word around the finding contains `@`,
 * `:`, or `www`. GFM turns such words into links without any markup, so
 * replacing a character in them could create a link or change its target
 * (`admin<U+2013>evil@example.com` would link to `admin-evil@example.com`).
 */
const isInPossibleAutolink = (
  sourceText: string,
  finding: Finding,
): boolean => {
  let start = finding.offset;
  while (start > 0 && !whitespacePattern.test(sourceText.charAt(start - 1))) {
    start -= 1;
    if (finding.offset - start > MAXIMUM_SCANNED_WORD_LENGTH) {
      return true;
    }
  }
  let end = finding.offset + finding.length;
  while (
    end < sourceText.length &&
    !whitespacePattern.test(sourceText.charAt(end))
  ) {
    end += 1;
    if (end - finding.offset > MAXIMUM_SCANNED_WORD_LENGTH) {
      return true;
    }
  }
  return autolinkSignPattern.test(sourceText.slice(start, end));
};

/**
 * Corrects a finding with its ASCII replacement where that is safe: fixed
 * in Markdown prose, fixed in code only when `fixesCode` is set and the
 * language's adapter fixes code too (otherwise suggested), suggested in
 * comments, strings, and rendered or unstructured text, and never touched in
 * identifiers.
 *
 * Comments are only suggested because tools read them: a fixed dash turns
 * `eslint<U+2010>disable` or `@ts<U+2013>ignore` into a live directive, and a
 * fixed shebang changes the command that runs the file. In Markdown prose, a
 * block that contains `<`, `[`, or `]` and a word that could be an autolink
 * are only suggested, so a fix cannot create markup or retarget a link.
 *
 * A replacement that inserts a line break is only ever suggested (in YAML,
 * TOML, and JSON with comments a line break ends a comment, and in Markdown
 * it could start a new block), and so is a replacement that joins characters
 * of a comment terminator with its neighbors.
 */
export const correctWithReplacement = (
  finding: Finding,
  { adapter, sourceText }: CorrectionEnvironment,
  { fixesCode }: CorrectionOptions,
): Correction => {
  const { replacement } = finding;
  if (replacement === undefined) {
    return undefined;
  }
  const suggestion: Correction = {
    kind: 'suggestion',
    text: replacement,
    messageId: SUGGEST_REPLACEMENT_MESSAGE_ID,
  };
  const fix: Correction =
    lineBreakPattern.test(replacement) ||
    joinsCommentTerminator(finding, replacement, sourceText)
      ? suggestion
      : { kind: 'fix', text: replacement };
  switch (finding.context) {
    case 'comment':
      return suggestion;
    case 'text':
      return adapter.fixesText === true &&
        !isInBlockWithMarkup(sourceText, finding.offset) &&
        !isInPossibleAutolink(sourceText, finding)
        ? fix
        : suggestion;
    case 'string':
      return suggestion;
    case 'code':
      if (!fixesCode) {
        return undefined;
      }
      return adapter.fixesCode === true ? fix : suggestion;
    case 'identifier':
      return undefined;
  }
};
