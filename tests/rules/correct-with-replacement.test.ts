import { describe, expect, it } from 'vitest';
import type { Finding } from '../../src/core/scan-text.ts';
import type { SourceContext } from '../../src/core/source-context.ts';
import type { LanguageAdapter } from '../../src/languages/language-adapter.ts';
import { correctWithReplacement } from '../../src/rules/correct-with-replacement.ts';

const createAdapter = (fixesText: boolean): LanguageAdapter => ({
  name: 'test',
  defaultContext: 'text',
  fixesText,
  matches: () => true,
  collectContextRanges: () => [],
});

const createFinding = (
  context: SourceContext,
  replacement?: string,
): Finding => ({
  offset: 0,
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
          createAdapter(fixesText),
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
          createAdapter(fixesText),
          { fixesCode },
        )?.kind,
      ).toBe(kind);
    },
  );

  it('returns nothing without a replacement', () => {
    expect(
      correctWithReplacement(createFinding('comment'), createAdapter(true), {
        fixesCode: true,
      }),
    ).toBeUndefined();
  });
});
