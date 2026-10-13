import { describe, expect, it } from 'vitest';
import type { Finding } from '../../src/core/scan-text.ts';
import type { SourceContext } from '../../src/core/source-context.ts';
import type { LanguageAdapter } from '../../src/languages/language-adapter.ts';
import { correctWithReplacement } from '../../src/rules/correct-with-replacement.ts';

const createAdapter = (fixesCode: boolean): LanguageAdapter => ({
  defaultContext: 'text',
  fixesCode,
  matches: () => true,
  collectContextRanges: () => [],
});

const createFinding = (
  context: SourceContext,
  replacement?: string,
): Finding => ({
  offset: 0,
  length: 1,
  codePoint: 0x00a0,
  count: 1,
  category: 'unusual-whitespace',
  context,
  ...(replacement === undefined ? {} : { replacement }),
});

describe('correctWithReplacement', () => {
  it.each([
    ['comment', true, true, 'suggestion'],
    ['string', true, true, 'suggestion'],
    ['text', true, true, 'suggestion'],
    ['code', true, true, 'fix'],
    ['code', false, true, 'suggestion'],
    ['code', true, false, undefined],
    ['identifier', true, true, undefined],
  ] as const)(
    'in %s (adapter fixes code %s, rule fixes code %s) returns %s',
    (context, adapterFixesCode, fixesCode, kind) => {
      expect(
        correctWithReplacement(
          createFinding(context, ' '),
          createAdapter(adapterFixesCode),
          { fixesCode },
        )?.kind,
      ).toBe(kind);
    },
  );

  it('only suggests a replacement that inserts a line break, also in code', () => {
    expect(
      correctWithReplacement(createFinding('code', '\n'), createAdapter(true), {
        fixesCode: true,
      })?.kind,
    ).toBe('suggestion');
  });

  it('returns nothing without a replacement', () => {
    expect(
      correctWithReplacement(createFinding('code'), createAdapter(true), {
        fixesCode: true,
      }),
    ).toBeUndefined();
  });
});
