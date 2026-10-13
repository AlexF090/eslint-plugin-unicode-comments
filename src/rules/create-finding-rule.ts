import type {
  LanguageOptions,
  MessagePlaceholderData,
  RuleContext,
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
  type CharacterPredicate,
} from '../core/allow-list.ts';
import { describeCodePoint } from '../core/character-names.ts';
import {
  groupFindings,
  type Finding,
  type FindingCategory,
} from '../core/scan-text.ts';
import type { SourceContext } from '../core/source-context.ts';
import type { LanguageAdapter } from '../languages/language-adapter.ts';
import {
  isLocatableSourceCode,
  scanSourceCode,
  type LocatableSourceCode,
} from './scan-source-code.ts';

const REPOSITORY_URL =
  'https://github.com/AlexF090/eslint-plugin-unicode-guard';

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

export type FindingRuleContext = RuleContext<
  Omit<FindingRuleTypeOptions, 'Visitor' | 'ExtRuleDocs'>
>;

/** How a finding may be corrected: applied automatically, offered as a suggestion, or not at all. */
export type Correction =
  | { kind: 'fix'; text: string }
  | { kind: 'suggestion'; text: string; messageId: string }
  | undefined;

export interface FindingRuleSettings {
  name: string;
  type: RuleType;
  description: string;
  messages: Record<string, string>;
  schema: NonNullable<RulesMeta['schema']>;
  defaultOptions: unknown[];
  /** Set when `correction` can return `{ kind: 'fix' }`. */
  fixable?: boolean;
  /**
   * Called once per file with the rule options; returns the predicate that
   * decides which findings this rule reports. `compileAllowList` turns allow
   * entries into a character predicate and reports malformed entries with
   * the rule name.
   */
  createSelector(
    options: readonly unknown[],
    compileAllowList: (entries: readonly string[]) => CharacterPredicate,
  ): (finding: Finding) => boolean;
  messageId(finding: Finding): string;
  correction?(finding: Finding, adapter: LanguageAdapter): Correction;
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
  (ruleName: string) =>
  (entries: readonly string[]): CharacterPredicate => {
    try {
      return compileAllowList(entries);
    } catch (error) {
      if (error instanceof InvalidAllowEntryError) {
        throw new Error(`unicode-guard/${ruleName}: ${error.message}`, {
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

const reportFinding = (
  context: FindingRuleContext,
  sourceCode: LocatableSourceCode,
  settings: FindingRuleSettings,
  adapter: LanguageAdapter,
  finding: Finding,
): void => {
  const correction = settings.correction?.(finding, adapter);
  const range = toRange(finding);
  const applyCorrection =
    (text: string): RuleFixer =>
    (fixer) =>
      fixer.replaceTextRange(range, text);

  context.report({
    loc: {
      start: sourceCode.getLocFromIndex(range[0]),
      end: sourceCode.getLocFromIndex(range[1]),
    },
    messageId: settings.messageId(finding),
    data: createMessageData(finding),
    fix: correction?.kind === 'fix' ? applyCorrection(correction.text) : null,
    suggest:
      correction?.kind === 'suggestion'
        ? [
            {
              messageId: correction.messageId,
              data: createMessageData(finding),
              fix: applyCorrection(correction.text),
            },
          ]
        : null,
  });
};

/**
 * Builds a rule that scans the raw text of any ESLint language once per file
 * and reports the findings `settings.selects` accepts. Rules do not declare
 * `meta.languages`, so ESLint runs them for every language.
 */
export const createFindingRule = (
  settings: FindingRuleSettings,
): FindingRule => {
  const hasSuggestions = Object.keys(settings.messages).some((messageId) =>
    messageId.startsWith('suggest'),
  );
  return {
    meta: {
      type: settings.type,
      docs: {
        description: settings.description,
        recommended: true,
        url: `${REPOSITORY_URL}/blob/main/docs/rules/${settings.name}.md`,
      },
      ...(settings.fixable === true ? { fixable: 'code' as const } : {}),
      hasSuggestions,
      schema: settings.schema,
      defaultOptions: settings.defaultOptions,
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
            `unicode-guard/${settings.name}: the source code object of this language is not text or has no getLocFromIndex() method, so findings cannot be located.`,
          );
        }
        const { findings, adapter } = scanSourceCode(sourceCode);
        const selected = findings.filter(selects);
        for (const finding of groupFindings(sourceCode.text, selected)) {
          reportFinding(context, sourceCode, settings, adapter, finding);
        }
      };

      const rootType = Reflect.get(Object(sourceCode.ast), 'type');
      return typeof rootType === 'string' ? { [rootType]: checkFile } : {};
    },
  };
};
