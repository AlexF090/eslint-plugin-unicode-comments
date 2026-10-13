import { describe, expect, it } from 'vitest';
import type { Finding } from '../../src/core/scan-text.ts';
import type { SourceContext } from '../../src/core/source-context.ts';
import { correctWithReplacement } from '../../src/rules/correct-with-replacement.ts';
import type { CorrectionEnvironment } from '../../src/rules/create-finding-rule.ts';

const createEnvironment = (
  fixesText: boolean,
  sourceText = 'a \u2014 b',
): CorrectionEnvironment => ({
  adapter: {
    defaultContext: 'text',
    fixesText,
    fixesCode: true,
    matches: () => true,
    collectContextRanges: () => [],
  },
  sourceText,
});

const createFinding = (
  context: SourceContext,
  replacement?: string,
): Finding => ({
  offset: 2,
  length: 1,
  codePoint: 0x2014,
  count: 1,
  category: 'typographic',
  context,
  ...(replacement === undefined ? {} : { replacement }),
});

describe('correctWithReplacement', () => {
  it.each([
    ['comment', true, true, 'suggestion'],
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

  it('only suggests in code when the language does not fix code', () => {
    const { adapter, sourceText } = createEnvironment(false);
    expect(
      correctWithReplacement(
        createFinding('code', ' '),
        { adapter: { ...adapter, fixesCode: false }, sourceText },
        { fixesCode: true },
      )?.kind,
    ).toBe('suggestion');
  });
});
