import { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';
import unicodeGuard from '../../src/index.ts';
import { qualifyName } from '../../src/plugin-namespace.ts';

const lintWithOptions = (ruleName: string, options: unknown) =>
  new Linter().verify(
    'const a = 1;',
    {
      plugins: { 'unicode-guard': unicodeGuard },
      rules: { [qualifyName(ruleName)]: ['error', options] },
    },
    { filename: 'a.js' },
  );

describe('rule metadata', () => {
  it('links every rule to its documentation in the repository', () => {
    for (const [name, rule] of Object.entries(unicodeGuard.rules)) {
      expect(rule.meta?.docs?.url).toBe(
        `https://github.com/AlexF090/eslint-plugin-unicode-guard/blob/main/docs/rules/${name}.md`,
      );
    }
  });
});

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

describe('rule metadata', () => {
  it.each(Object.entries(unicodeGuard.rules))(
    '%s declares hasSuggestions exactly when it has a suggestion message',
    (_name, rule) => {
      const hasSuggestionMessage = Object.keys(rule.meta?.messages ?? {}).some(
        (messageId) => messageId.startsWith('suggest'),
      );
      expect(rule.meta?.hasSuggestions).toBe(hasSuggestionMessage);
    },
  );
});
