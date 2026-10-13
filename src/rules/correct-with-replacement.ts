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

/**
 * Corrects a finding with its ASCII replacement where that is safe: fixed
 * in comments and prose, suggested in strings and rendered or unstructured
 * text (a fix there could change a value or break embedded code), fixed in
 * code only when `fixesCode` is set (and only suggested unless the language's
 * adapter fixes code too), and never touched in identifiers.
 *
 * A replacement that inserts a line break is only ever suggested: in YAML,
 * TOML, and JSON with comments a line break ends a comment, so fixing a line
 * separator would turn the rest of the comment into live configuration, and
 * in Markdown it could start a new block. A replacement that joins characters
 * of a comment terminator with its neighbors is only suggested
 * as well, so a fix cannot end a comment early.
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
      return fix;
    case 'text':
      return adapter.fixesText === true ? fix : suggestion;
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
