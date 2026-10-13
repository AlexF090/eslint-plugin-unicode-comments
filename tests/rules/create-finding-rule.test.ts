import { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';
import unicodeGuard from '../../src/index.ts';

const lintWithOptions = (ruleName: string, options: unknown) =>
  new Linter().verify(
    'const a = 1;',
    {
      plugins: { 'unicode-guard': unicodeGuard },
      rules: { [`unicode-guard/${ruleName}`]: ['error', options] },
    },
    { filename: 'a.js' },
  );

describe('rule options', () => {
  it('names the rule and the entry when an allow entry is malformed', () => {
    expect(() =>
      lintWithOptions('no-invisible-characters', { allow: ['zero width'] }),
    ).toThrow(
      'unicode-guard/no-invisible-characters: Invalid allow entry "zero width": unrecognized format',
    );
  });

  it('validates allowed-characters policies per context', () => {
    expect(() =>
      lintWithOptions('allowed-characters', { comment: ['U+0500..U+0400'] }),
    ).toThrow('unicode-guard/allowed-characters');
  });

  it('rejects unknown option keys through the JSON schema', () => {
    expect(() =>
      lintWithOptions('no-bidi-control', { allowed: ['U+200F'] }),
    ).toThrow(
      /should NOT have additional properties|must NOT have additional properties/u,
    );
  });
});
