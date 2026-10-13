import type { TextSourceCode } from '@eslint/core';
import { scanText, type Finding } from '../core/scan-text.ts';
import { createContextResolver } from '../core/source-context.ts';
import type { LanguageAdapter } from '../languages/language-adapter.ts';
import { resolveLanguageAdapter } from '../languages/resolve-language-adapter.ts';

export interface Position {
  line: number;
  column: number;
}

/** Every ESLint source code implementation (JavaScript and `@eslint/plugin-kit` based ones) provides this method, but `@eslint/core` does not declare it. */
export interface LocatableSourceCode extends TextSourceCode {
  getLocFromIndex(index: number): Position;
}

/** Narrows to text-based source code (ESLint also supports binary languages) that can map offsets to positions. */
export const isLocatableSourceCode = (
  sourceCode: object,
): sourceCode is LocatableSourceCode =>
  typeof Reflect.get(sourceCode, 'text') === 'string' &&
  typeof Reflect.get(sourceCode, 'getLocFromIndex') === 'function';

export interface SourceScan {
  /** Ungrouped findings for the whole file, each tagged with its source context. */
  findings: Finding[];
  adapter: LanguageAdapter;
}

export const scanSourceCode = (sourceCode: TextSourceCode): SourceScan => {
  const adapter = resolveLanguageAdapter(sourceCode.ast);
  const resolveContext = createContextResolver(
    adapter.collectContextRanges(sourceCode),
    adapter.defaultContext,
  );
  return { findings: scanText(sourceCode.text, resolveContext), adapter };
};
