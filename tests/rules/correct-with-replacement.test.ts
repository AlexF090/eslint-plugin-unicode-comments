import { describe, expect, it } from 'vitest';
import type { Finding } from '../../src/core/scan-text.ts';
import type { SourceContext } from '../../src/core/source-context.ts';
import { correctWithReplacement } from '../../src/rules/correct-with-replacement.ts';
import type { CorrectionEnvironment } from '../../src/rules/create-finding-rule.ts';

const createEnvironment = (
  fixesText: boolean,
  sourceText = ' \u2014 ',
): CorrectionEnvironment => ({
  adapter: {
    name: 'test',
    defaultContext: 'text',
    fixesText,
    matches: () => true,
    collectContextRanges: () => [],
  },
  sourceText,
});

const createFinding = (
  context: SourceContext,
  replacement?: string,
): Finding => ({
  offset: 1,
  length: 1,
  codePoint: 0x2014,
  count: 1,
  category: 'typographic',
  context,
  ...(replacement === undefined ? {} : { replacement }),
});

describe('correctWithReplacement', () => {
  it.each([
    ['comment', false, false, 'fix'],
    ['text', true, false, 'fix'],
    ['text', false, false, 'suggestion'],
    ['string', true, false, 'suggestion'],
    ['code', false, true, 'fix'],
    ['code', false, false, undefined],
    ['identifier', true, true, undefined],
  ] as const)(
    'in %s (fixesText %s, fixesCode %s) returns %s',
    (context, fixesText, fixesCode, kind) => {
      expect(
        correctWithReplacement(
          createFinding(context, '-'),
          createEnvironment(fixesText),
          { fixesCode },
        )?.kind,
      ).toBe(kind);
    },
  );

  it.each([
    ['comment', false, false, 'suggestion'],
    ['text', true, false, 'suggestion'],
    ['code', false, true, 'suggestion'],
    ['code', false, false, undefined],
    ['identifier', true, true, undefined],
  ] as const)(
    'with a line break replacement in %s (fixesText %s, fixesCode %s) returns %s',
    (context, fixesText, fixesCode, kind) => {
      expect(
        correctWithReplacement(
          createFinding(context, '\n'),
          createEnvironment(fixesText),
          { fixesCode },
        )?.kind,
      ).toBe(kind);
    },
  );

  it('returns nothing without a replacement', () => {
    expect(
      correctWithReplacement(
        createFinding('comment'),
        createEnvironment(true),
        {
          fixesCode: true,
        },
      ),
    ).toBeUndefined();
  });

  it.each([
    ['-\u2192 b', '->', 'suggestion'],
    ['\u2013\u2192', '-', 'suggestion'],
    ['a\u2014>', '--', 'suggestion'],
    ['*\u2215', '/', 'suggestion'],
    ['a\u2013b', '-', 'fix'],
    [' \u2192 ', '->', 'fix'],
  ] as const)(
    'in a comment %j with replacement %j returns %s',
    (sourceText, replacement, kind) => {
      expect(
        correctWithReplacement(
          createFinding('comment', replacement),
          createEnvironment(false, sourceText),
          { fixesCode: false },
        )?.kind,
      ).toBe(kind);
    },
  );
});
