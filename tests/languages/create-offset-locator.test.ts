import fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';
import { createOffsetLocator } from '../../src/rules/create-offset-locator.ts';
import {
  isLocatableSourceCode,
  type LocatableSourceCode,
} from '../../src/rules/scan-source-code.ts';
import { sourceCodeOf } from './lint-file.ts';

/** `undefined` when the language could not parse the text. */
const toLocatable = (sourceCode: unknown): LocatableSourceCode | undefined =>
  typeof sourceCode === 'object' &&
  sourceCode !== null &&
  isLocatableSourceCode(sourceCode)
    ? sourceCode
    : undefined;

const requireLocatable = (sourceCode: unknown): LocatableSourceCode => {
  const locatable = toLocatable(sourceCode);
  if (locatable === undefined) {
    throw new Error('Expected a text source code with getLocFromIndex().');
  }
  return locatable;
};

// JSON needs a value besides the comments, so its text gets a trailing `1`.
const commentSyntax: Record<string, (content: string) => string> = {
  'a.js': (content) => `// ${content}`,
  'a.ts': (content) => `// ${content}`,
  'a.json': (content) => `// ${content}`,
  'a.css': (content) => `/* ${content} */`,
  'a.yaml': (content) => `# ${content}`,
  'a.toml': (content) => `# ${content}`,
  'a.html': (content) => `<p>${content}</p>`,
  'a.md': (content) => content,
  'a.txt': (content) => content,
  'AGENTS.md': (content) => content,
};

const contentArbitrary = fc
  .array(fc.constantFrom('a', ' ', '\u00E4', '\u{1F600}', '\u2014'), {
    maxLength: 6,
  })
  .map((characters) => characters.join(''));

const separatorArbitrary = fc.constantFrom('\n', '\r\n', '\r', '\u2028');

describe('createOffsetLocator', () => {
  it.each(Object.entries(commentSyntax))(
    'matches getLocFromIndex() for every character offset in %s',
    (filename, wrap) => {
      fc.assert(
        fc.property(
          fc.array(fc.tuple(contentArbitrary, separatorArbitrary), {
            maxLength: 5,
          }),
          fc.boolean(),
          (lines, endsWithLineBreak) => {
            const text =
              lines
                .map(([content, separator], index) =>
                  index < lines.length - 1 || endsWithLineBreak
                    ? wrap(content) + separator
                    : wrap(content),
                )
                .join('') + (filename === 'a.json' ? '\n1' : '');
            const sourceCode = toLocatable(sourceCodeOf(filename, text));
            fc.pre(sourceCode !== undefined);
            const locate = createOffsetLocator(sourceCode);
            // The end of the text is left out: some languages report the end
            // of their root node there, which is not always the text end.
            for (let offset = 0; offset < text.length; offset += 1) {
              expect(locate(offset)).toEqual(
                sourceCode.getLocFromIndex(offset),
              );
            }
          },
        ),
        { numRuns: 50 },
      );
    },
  );

  it('asks the source code for one position only, however many offsets it locates', () => {
    const sourceCode = requireLocatable(
      sourceCodeOf('a.txt', 'a\u2014'.repeat(1000)),
    );
    const getLocFromIndex = vi.spyOn(sourceCode, 'getLocFromIndex');
    const locate = createOffsetLocator(sourceCode);
    for (let offset = 0; offset < 2000; offset += 1) {
      locate(offset);
    }
    expect(getLocFromIndex).toHaveBeenCalledTimes(1);
  });

  it('falls back to getLocFromIndex() without a lines array', () => {
    const getLocFromIndex = vi.fn(() => ({ line: 7, column: 3 }));
    const locate = createOffsetLocator({
      text: 'abc',
      ast: {},
      getLocFromIndex,
    } as unknown as LocatableSourceCode);
    expect(locate(2)).toEqual({ line: 7, column: 3 });
  });
});
