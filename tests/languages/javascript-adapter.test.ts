import { describe, expect, it } from 'vitest';
import { createContextResolver } from '../../src/core/source-context.ts';
import { javascriptAdapter } from '../../src/languages/javascript.ts';

describe('javascriptAdapter', () => {
  it('treats markup around the script tokens of single-file components as text', () => {
    const template = '<template><p>a b</p></template>\n<script>\n';
    const script = 'const x = 1;\n';
    const text = `${template}${script}</script>\n<p>c d</p>\n`;
    const scriptStart = template.length;
    const tokens = [
      { type: 'Keyword', range: [scriptStart, scriptStart + 5] },
      { type: 'Punctuator', range: [scriptStart + 11, scriptStart + 12] },
    ];
    const resolveContext = createContextResolver(
      javascriptAdapter.collectContextRanges({
        text,
        ast: { type: 'Program', tokens, comments: [] },
      }),
      javascriptAdapter.defaultContext,
    );
    expect(resolveContext(text.indexOf('a b') + 1)).toBe('text');
    expect(resolveContext(text.indexOf('c d') + 1)).toBe('text');
    expect(resolveContext(scriptStart + 5)).toBe('code');
  });
});
