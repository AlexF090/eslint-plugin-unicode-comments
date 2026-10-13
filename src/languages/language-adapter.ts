import type { ContextRange, SourceContext } from '../core/source-context.ts';

/** The part of an ESLint `SourceCode` object that language adapters read. */
export interface ScannableSourceCode {
  text: string;
  ast: unknown;
}

export interface LanguageAdapter {
  matches(ast: unknown): boolean;
  collectContextRanges(sourceCode: ScannableSourceCode): ContextRange[];
  /** Context of text that no collected range covers. */
  defaultContext: SourceContext;
  /**
   * Whether autofixes may replace unusual whitespace in `code` context. Only
   * true where the language already treats that whitespace as a separator
   * (JavaScript); in HTML and CSS it is part of a name, so replacing it would
   * change the structure, for example turn an inert attribute into a live
   * event handler.
   */
  fixesCode?: boolean;
}
