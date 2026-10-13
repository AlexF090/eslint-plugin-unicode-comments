import type { RulesMeta } from '@eslint/core';
import type { CharacterPredicate } from '../core/allow-list.ts';
import type { Finding, FindingCategory } from '../core/scan-text.ts';

export interface AllowOption {
  allow?: string[];
}

export type AllowRuleOptions = [AllowOption];

export const allowEntrySchema = {
  type: 'array',
  items: { type: 'string', minLength: 1 },
  uniqueItems: true,
} as const;

export const allowOptionSchema: NonNullable<RulesMeta['schema']> = [
  {
    type: 'object',
    properties: { allow: allowEntrySchema },
    additionalProperties: false,
  },
];

export const defaultAllowOptions: AllowRuleOptions = [{ allow: [] }];

export const characterOf = (finding: Finding): string =>
  String.fromCodePoint(finding.codePoint);

/** Selects findings of the given categories whose character is not in the rule's `allow` option. */
export const selectCategories =
  (categories: readonly FindingCategory[]) =>
  (
    options: AllowRuleOptions,
    compileAllowList: (entries: readonly string[]) => CharacterPredicate,
  ): ((finding: Finding) => boolean) => {
    const categorySet = new Set(categories);
    const isAllowed = compileAllowList(options[0].allow ?? []);
    return (finding) =>
      categorySet.has(finding.category) && !isAllowed(characterOf(finding));
  };
