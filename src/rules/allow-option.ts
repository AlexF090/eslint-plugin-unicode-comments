import type { RulesMeta } from '@eslint/core';
import type { CharacterPredicate } from '../core/allow-list.ts';
import type { Finding, FindingCategory } from '../core/scan-text.ts';

import { isRecord } from '../core/is-record.ts';

export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string');

/** The `allow` entries of the first rule option; the JSON schema has already validated its shape. */
export const readAllowEntries = (options: readonly unknown[]): string[] => {
  const [firstOption] = options;
  const allow = isRecord(firstOption) ? firstOption['allow'] : undefined;
  return isStringArray(allow) ? allow : [];
};

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

export const defaultAllowOptions = [{ allow: [] }];

export const characterOf = (finding: Finding): string =>
  String.fromCodePoint(finding.codePoint);

/** Selects findings of the given categories whose character is not in the rule's `allow` option. */
export const selectCategories =
  (categories: readonly FindingCategory[]) =>
  (
    options: readonly unknown[],
    compileAllowList: (entries: readonly string[]) => CharacterPredicate,
  ): ((finding: Finding) => boolean) => {
    const categorySet = new Set(categories);
    const isAllowed = compileAllowList(readAllowEntries(options));
    return (finding) =>
      categorySet.has(finding.category) && !isAllowed(characterOf(finding));
  };
