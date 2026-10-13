import type { File } from '@eslint/core';
import { describe, expect, it } from 'vitest';
import {
  PlainTextSourceCode,
  TEXT_DOCUMENT_TYPE,
  textLanguage,
} from '../../src/languages/text-language.ts';

const fileWith = (body: string | Uint8Array): File => ({
  body,
  path: 'a.txt',
  physicalPath: 'a.txt',
  bom: false,
});

describe('textLanguage', () => {
  it('parses text into one document node spanning the whole file', () => {
    const result = textLanguage.parse(fileWith('a\r\nbc\nd'), {
      languageOptions: {},
    });
    expect(result).toEqual({
      ok: true,
      ast: {
        type: TEXT_DOCUMENT_TYPE,
        range: [0, 7],
        loc: { start: { line: 1, column: 1 }, end: { line: 3, column: 2 } },
      },
    });
  });

  it('reports a parse error for a binary file body', () => {
    const result = textLanguage.parse(fileWith(new Uint8Array([1, 2])), {
      languageOptions: {},
    });
    expect(result).toMatchObject({
      ok: false,
      errors: [{ message: 'Expected the file body to be text.' }],
    });
  });

  it('refuses to create source code for a binary file body', () => {
    const parsed = textLanguage.parse(fileWith(''), { languageOptions: {} });
    if (!parsed.ok) {
      throw new Error('Expected empty text to parse.');
    }
    expect(() =>
      textLanguage.createSourceCode(fileWith(new Uint8Array([1, 2])), parsed, {
        languageOptions: {},
      }),
    ).toThrow(
      new TypeError(
        'unicode-guard/text: the body of a.txt is not text, so no source code can be created for it.',
      ),
    );
  });
});

describe('PlainTextSourceCode', () => {
  const text = 'line one\nline two';
  const parsed = textLanguage.parse(fileWith(text), { languageOptions: {} });
  if (!parsed.ok) {
    throw new Error('Expected plain text to parse.');
  }
  const sourceCode = new PlainTextSourceCode(text, parsed.ast);

  it('has no parent nodes', () => {
    expect(sourceCode.getParent()).toBeUndefined();
  });

  it('visits the document node once on enter and once on exit', () => {
    expect(
      [...sourceCode.traverse()].map((step) => [step.target, step.phase]),
    ).toEqual([
      [parsed.ast, 1],
      [parsed.ast, 2],
    ]);
  });

  it('splits lines at line feeds, carriage returns, and both', () => {
    expect(new PlainTextSourceCode('a\rb\r\nc\nd', parsed.ast).lines).toEqual([
      'a',
      'b',
      'c',
      'd',
    ]);
  });
});
