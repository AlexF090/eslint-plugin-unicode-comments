import { describe, expect, it } from 'vitest';
import type { Finding } from '../../src/core/scan-text.ts';
import type { SourceContext } from '../../src/core/source-context.ts';
import type { LanguageAdapter } from '../../src/languages/language-adapter.ts';
import { fixWhitespaceBetweenTokens } from '../../src/rules/fix-whitespace-between-tokens.ts';

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

describe('fixWhitespaceBetweenTokens', () => {
  it('returns the replacement in code of an adapter that fixes code', () => {
    expect(
      fixWhitespaceBetweenTokens(
        createFinding('code', ' '),
        createAdapter(true),
      ),
    ).toBe(' ');
  });

  it('returns nothing in code of an adapter that does not fix code', () => {
    expect(
      fixWhitespaceBetweenTokens(
        createFinding('code', ' '),
        createAdapter(false),
      ),
    ).toBeUndefined();
  });

  it.each(['comment', 'string', 'text', 'identifier'] as const)(
    'returns nothing in %s',
    (context) => {
      expect(
        fixWhitespaceBetweenTokens(
          createFinding(context, ' '),
          createAdapter(true),
        ),
      ).toBeUndefined();
    },
  );

  it.each(['\n', '\r', ' \n '])(
    'returns nothing for the replacement %j that contains a line break',
    (replacement) => {
      expect(
        fixWhitespaceBetweenTokens(
          createFinding('code', replacement),
          createAdapter(true),
        ),
      ).toBeUndefined();
    },
  );

  it('returns nothing without a replacement', () => {
    expect(
      fixWhitespaceBetweenTokens(createFinding('code'), createAdapter(true)),
    ).toBeUndefined();
  });
});
