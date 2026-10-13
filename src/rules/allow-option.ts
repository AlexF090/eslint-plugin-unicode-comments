import type { RulesMeta } from '@eslint/core';
import type { CharacterPredicate } from '../core/allow-list.ts';
import type { Finding, FindingCategory } from '../core/scan-text.ts';

import { isRecord } from '../core/is-record.ts';

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string');

/** The allow entries under `key` of a rule option; the JSON schema has already validated its shape. */
export const readAllowEntries = (option: unknown, key: string): string[] => {
  const entries = isRecord(option) ? option[key] : undefined;
  return isStringArray(entries) ? entries : [];
};

/** Turns allow entries into a character predicate, reporting malformed entries with the rule name. */
export type AllowEntryCompiler = (
  entries: readonly string[],
) => CharacterPredicate;

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
    [firstOption]: readonly unknown[],
    compileAllowEntries: AllowEntryCompiler,
  ): ((finding: Finding) => boolean) => {
    const categorySet = new Set(categories);
    const isAllowed = compileAllowEntries(
      readAllowEntries(firstOption, 'allow'),
    );
    return (finding) =>
      categorySet.has(finding.category) && !isAllowed(characterOf(finding));
  };
