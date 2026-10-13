import type {
  LanguageOptions,
  MessagePlaceholderData,
  RuleDefinition,
  RuleFixer,
  RulesMeta,
  RuleType,
  RuleVisitor,
  SourceCode,
} from '@eslint/core';
import {
  compileAllowList,
  InvalidAllowEntryError,
} from '../core/allow-list.ts';
import { describeCodePoint } from '../core/character-names.ts';
import {
  groupFindings,
  type Finding,
  type FindingCategory,
} from '../core/scan-text.ts';
import type { SourceContext } from '../core/source-context.ts';
import type { LanguageAdapter } from '../languages/language-adapter.ts';
import { readPackageMetadata } from '../package-metadata.ts';
import { qualifyName } from '../plugin-namespace.ts';
import {
  allowOptionSchema,
  defaultAllowOptions,
  type AllowEntryCompiler,
} from './allow-option.ts';
import { createOffsetLocator } from './create-offset-locator.ts';
import { isLocatableSourceCode, scanSourceCode } from './scan-source-code.ts';

const { repositoryUrl } = readPackageMetadata();

export interface FindingRuleTypeOptions {
  LangOptions: LanguageOptions;
  Code: SourceCode;
  RuleOptions: unknown[];
  Visitor: RuleVisitor;
  Node: unknown;
  MessageIds: string;
  ExtRuleDocs: unknown;
}

/**
 * Options are typed as `unknown[]` so the rules stay assignable to the rule
 * types of every supported ESLint version; each rule validates its options
 * with a JSON schema and reads them through a type guard.
 */
export type FindingRule = RuleDefinition<FindingRuleTypeOptions>;

export interface FindingRuleSettings {
  name: string;
  type: RuleType;
  description: string;
  messages: Record<string, string>;
  /** Defaults to the `allow` option shared by the category rules. */
  schema?: NonNullable<RulesMeta['schema']>;
  defaultOptions?: unknown[];
  /** Set when `fix` can return a replacement. */
  fixable?: boolean;
  /**
   * Called once per file with the rule options; returns the predicate that
   * decides which findings this rule reports. `compileAllowEntries` turns
   * allow entries into a character predicate and reports malformed entries
   * with the rule name.
   */
  createSelector(
    options: readonly unknown[],
    compileAllowEntries: AllowEntryCompiler,
  ): (finding: Finding) => boolean;
  messageId(finding: Finding): string;
  /** The text that replaces the finding automatically, if any. */
  fix?(finding: Finding, adapter: LanguageAdapter): string | undefined;
}

const contextPhrases: Record<SourceContext, string> = {
  code: 'code',
  identifier: 'an identifier',
  comment: 'a comment',
  string: 'a string',
  text: 'text',
};

const visibleCategories: ReadonlySet<FindingCategory> = new Set([
  'typographic',
  'lookalike',
  'mixed-script',
  'other',
]);

const describeFinding = (finding: Finding): string => {
  const description = describeCodePoint(finding.codePoint);
  const withGlyph = visibleCategories.has(finding.category)
    ? `${description} ("${String.fromCodePoint(finding.codePoint)}")`
    : description;
  return finding.count > 1
    ? `${finding.count} characters starting with ${withGlyph}`
    : withGlyph;
};

export const createMessageData = (
  finding: Finding,
): MessagePlaceholderData => ({
  character: describeFinding(finding),
  context: contextPhrases[finding.context],
  replacement: finding.replacement,
  imitates: finding.imitates,
  script: finding.script,
  dominantScript: finding.dominantScript,
  hiddenText: finding.hiddenText,
});

const compileAllowListForRule =
  (ruleName: string): AllowEntryCompiler =>
  (entries) => {
    try {
      return compileAllowList(entries);
    } catch (error) {
      if (error instanceof InvalidAllowEntryError) {
        throw new Error(`${qualifyName(ruleName)}: ${error.message}`, {
          cause: error,
        });
      }
      throw error;
    }
  };

const toRange = (finding: Finding): [number, number] => [
  finding.offset,
  finding.offset + finding.length,
];

const replaceRange =
  (range: [number, number], text: string): RuleFixer =>
  (fixer) =>
    fixer.replaceTextRange(range, text);

/**
 * Builds a rule that scans the raw text of any ESLint language once per file
 * and reports the findings the selector from `settings.createSelector`
 * accepts. Rules do not declare
 * `meta.languages`, so ESLint runs them for every language.
 */
export const createFindingRule = (
  settings: FindingRuleSettings,
): FindingRule => {
  return {
    meta: {
      type: settings.type,
      docs: {
        description: settings.description,
        recommended: true,
        url: `${repositoryUrl}/blob/main/docs/rules/${settings.name}.md`,
      },
      ...(settings.fixable === true ? { fixable: 'code' as const } : {}),
      schema: settings.schema ?? allowOptionSchema,
      defaultOptions: settings.defaultOptions ?? defaultAllowOptions,
      messages: settings.messages,
    },
    create(context) {
      const { sourceCode } = context;
      const selects = settings.createSelector(
        context.options,
        compileAllowListForRule(settings.name),
      );

      const checkFile = () => {
        if (!isLocatableSourceCode(sourceCode)) {
          throw new Error(
            `${qualifyName(settings.name)}: the source code object of this language is not text or has no getLocFromIndex() method, so findings cannot be located.`,
          );
        }
        const { findings, adapter } = scanSourceCode(sourceCode);
        const selected = findings.filter(selects);
        if (selected.length === 0) {
          return;
        }
        const locate = createOffsetLocator(sourceCode);
        const report = (finding: Finding): void => {
          const fixText = settings.fix?.(finding, adapter);
          const range = toRange(finding);
          context.report({
            loc: { start: locate(range[0]), end: locate(range[1]) },
            messageId: settings.messageId(finding),
            data: createMessageData(finding),
            fix: fixText === undefined ? null : replaceRange(range, fixText),
          });
        };
        for (const finding of groupFindings(sourceCode.text, selected)) {
          report(finding);
        }
      };

      const rootType = Reflect.get(Object(sourceCode.ast), 'type');
      return typeof rootType === 'string' ? { [rootType]: checkFile } : {};
    },
  };
};
