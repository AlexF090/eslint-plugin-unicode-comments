import type { ContextRange, SourceContext } from '../core/source-context.ts';

/** The part of an ESLint `SourceCode` object that language adapters read. */
export interface ScannableSourceCode {
  text: string;
  ast: unknown;
}

export interface LanguageAdapter {
  /** Language name used in documentation and error messages. */
  name: string;
  matches(ast: unknown): boolean;
  collectContextRanges(sourceCode: ScannableSourceCode): ContextRange[];
  /** Context of text that no collected range covers. */
  defaultContext: SourceContext;
}
