/**
 * Generates the Unicode data files in `src/core/` from a pinned Unicode
 * version. Run with `npm run generate:unicode-data` after changing
 * `UNICODE_VERSION`, then review the diff.
 *
 * - `latin-confusables.ts`: Latin characters that UTS #39 lists as
 *   confusable with one printable ASCII character and that NFKC does not
 *   already map to ASCII (those are found by normalization).
 * - `ascii-neighbor-confusables.ts`: characters that mixed-script detection
 *   cannot catch next to Latin, because they have no particular script
 *   (Script Common or Inherited, used in Latin text or in any script) or
 *   belong to a CJK script that may mix with Latin, and that UTS #39 lists
 *   as confusable with one ASCII letter, digit, or character used in URLs,
 *   paths, and command-line options, and that NFKC does not map to ASCII.
 * - `standardized-variation-sequences.ts`: base characters and the
 *   variation selectors VS1 to VS16 that StandardizedVariants.txt defines
 *   for them.
 * - `unicode-scripts.ts`: every Script property value, so mixed-script
 *   detection can tell any two scripts apart.
 *
 * Files are formatted with Prettier before they are written.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import {
  asciiWordOrUrlCharacterPattern,
  lookalikeExclusionPattern,
} from '../src/core/lookalike-patterns.ts';

const UNICODE_VERSION = '18.0.0';
const BASE_URL = `https://www.unicode.org/Public/${UNICODE_VERSION}`;
const LAST_LATIN_1_CODE_POINT = 0xff;
const FIRST_VARIATION_SELECTOR = 0xfe00;
const LAST_VARIATION_SELECTOR = 0xfe0f;

const hexPattern = /^[\dA-F]+$/u;
const printableAsciiPattern = /^[\x21-\x7E]$/u;
const latinPattern = /^\p{Script=Latin}$/u;
const commonScriptPattern = /^[\p{Script=Common}\p{Script=Inherited}]$/u;
// Characters whose Script_Extensions name other scripts only (CJK brackets
// and wave dashes, the Devanagari danda, the Arabic tatweel) are punctuation
// of those scripts' prose and stay out.
const usedInLatinTextPattern =
  /^[\p{Script_Extensions=Common}\p{Script_Extensions=Inherited}\p{Script_Extensions=Latin}]$/u;
// Scripts that mixed-script detection accepts next to Latin (Japanese,
// Chinese, and Korean text); see `allowedScriptCombinations` in
// `src/core/mixed-script.ts`.
const scriptsMixedWithLatinPattern =
  /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Bopomofo}]$/u;
const scriptsWithoutLetters = new Set(['Common', 'Inherited', 'Unknown']);

interface Confusable {
  codePoint: number;
  imitated: string;
}

const download = async (path: string): Promise<string> => {
  const url = `${BASE_URL}/${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Downloading ${url} failed with HTTP ${response.status}.`);
  }
  return response.text();
};

const toHex = (codePoint: number): string =>
  `0x${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;

const escapeAscii = (character: string): string =>
  character === "'" || character === '\\' ? `\\${character}` : character;

/** Confusables with one printable ASCII target that NFKC keeps as they are. */
const collectAsciiConfusables = (data: string): Confusable[] => {
  const confusables: Confusable[] = [];
  for (const line of data.split('\n')) {
    // Format: `source ;\ttarget code points ;\ttype\t# comment`
    const [sourceField, targetField] = line
      .split(';', 2)
      .map((field) => field.trim());
    if (
      sourceField === undefined ||
      targetField === undefined ||
      !hexPattern.test(sourceField)
    ) {
      continue;
    }
    const codePoint = Number.parseInt(sourceField, 16);
    const targets = targetField.split(' ');
    if (codePoint <= LAST_LATIN_1_CODE_POINT || targets.length !== 1) {
      continue;
    }
    const character = String.fromCodePoint(codePoint);
    const imitated = String.fromCodePoint(
      Number.parseInt(targets[0] ?? '', 16),
    );
    if (
      printableAsciiPattern.test(imitated) &&
      !printableAsciiPattern.test(character.normalize('NFKC'))
    ) {
      confusables.push({ codePoint, imitated });
    }
  }
  return confusables.sort((left, right) => left.codePoint - right.codePoint);
};

const isLatinConfusable = ({ codePoint }: Confusable): boolean =>
  latinPattern.test(String.fromCodePoint(codePoint));

const isAsciiNeighborConfusable = ({
  codePoint,
  imitated,
}: Confusable): boolean => {
  const character = String.fromCodePoint(codePoint);
  const isNeutral =
    commonScriptPattern.test(character) &&
    usedInLatinTextPattern.test(character);
  return (
    (isNeutral || scriptsMixedWithLatinPattern.test(character)) &&
    !lookalikeExclusionPattern.test(character) &&
    asciiWordOrUrlCharacterPattern.test(imitated)
  );
};

// Format: `base selector; description; # name`
const collectStandardizedVariationSequences = (
  data: string,
): Map<number, number[]> => {
  const selectorsByBase = new Map<number, number[]>();
  for (const line of data.split('\n')) {
    const [sequenceField] = line.split(';', 1).map((field) => field.trim());
    const [baseField, selectorField, ...rest] = (sequenceField ?? '').split(
      ' ',
    );
    if (
      baseField === undefined ||
      selectorField === undefined ||
      rest.length > 0 ||
      !hexPattern.test(baseField) ||
      !hexPattern.test(selectorField)
    ) {
      continue;
    }
    const selector = Number.parseInt(selectorField, 16);
    if (
      selector < FIRST_VARIATION_SELECTOR ||
      selector > LAST_VARIATION_SELECTOR
    ) {
      continue;
    }
    const base = Number.parseInt(baseField, 16);
    selectorsByBase.set(base, [...(selectorsByBase.get(base) ?? []), selector]);
  }
  return new Map([...selectorsByBase].sort(([left], [right]) => left - right));
};

// Format: `sc ; short name ; long name`
const collectScripts = (data: string): string[] =>
  data
    .split('\n')
    .map((line) => line.split(';').map((field) => field.trim()))
    .map(([property, , longName]) => (property === 'sc' ? longName : undefined))
    .filter(
      (script): script is string =>
        script !== undefined && !scriptsWithoutLetters.has(script),
    );

const header = `// Generated by scripts/generate-unicode-data.ts from Unicode ${UNICODE_VERSION}. Do not edit.\n// Derived from the Unicode Character Database and UTS #39 data files,\n// Copyright Unicode, Inc., Unicode License v3: https://www.unicode.org/license.txt\n\n`;

const writeFormatted = async (
  fileName: string,
  content: string,
): Promise<void> => {
  const url = new URL(`../src/core/${fileName}`, import.meta.url);
  const options = await resolveConfig(fileURLToPath(url));
  writeFileSync(
    url,
    await format(`${header}${content}`, {
      ...options,
      parser: 'typescript',
    }),
  );
};

const confusableEntries = (confusables: Confusable[]): string =>
  confusables
    .map(
      ({ codePoint, imitated }) =>
        `  [${toHex(codePoint)}, '${escapeAscii(imitated)}'],`,
    )
    .join('\n');

const writeLatinConfusables = (confusables: Confusable[]): Promise<void> =>
  writeFormatted(
    'latin-confusables.ts',
    `/** Latin code point to the ASCII character it imitates (UTS #39), for characters NFKC keeps as they are. */\nexport const latinConfusables: ReadonlyMap<number, string> = new Map([\n${confusableEntries(confusables)}\n]);\n`,
  );

const writeAsciiNeighborConfusables = (
  confusables: Confusable[],
): Promise<void> =>
  writeFormatted(
    'ascii-neighbor-confusables.ts',
    `/** Code point of no particular script or of a CJK script to the ASCII letter, digit, or URL character it imitates (UTS #39), for characters NFKC keeps as they are. */\nexport const asciiNeighborConfusables: ReadonlyMap<number, string> = new Map([\n${confusableEntries(confusables)}\n]);\n`,
  );

const writeStandardizedVariationSequences = (
  selectorsByBase: Map<number, number[]>,
): Promise<void> => {
  const entries = [...selectorsByBase]
    .map(
      ([base, selectors]) =>
        `  [${toHex(base)}, [${selectors.map(toHex).join(', ')}]],`,
    )
    .join('\n');
  return writeFormatted(
    'standardized-variation-sequences.ts',
    `/** Base code point to the variation selectors (VS1 to VS16) that StandardizedVariants.txt defines for it. */\nexport const standardizedVariationSequences: ReadonlyMap<\n  number,\n  readonly number[]\n> = new Map([\n${entries}\n]);\n`,
  );
};

const writeScripts = (scripts: string[]): Promise<void> => {
  const entries = scripts.map((script) => `  '${script}',`).join('\n');
  return writeFormatted(
    'unicode-scripts.ts',
    `/** Every Unicode Script property value except Common, Inherited, and Unknown. */\nexport const unicodeScripts: readonly string[] = [\n${entries}\n];\n`,
  );
};

const [confusablesData, standardizedVariantsData, aliasesData] =
  await Promise.all([
    download('security/confusables.txt'),
    download('ucd/StandardizedVariants.txt'),
    download('ucd/PropertyValueAliases.txt'),
  ]);
const asciiConfusables = collectAsciiConfusables(confusablesData);
await writeLatinConfusables(asciiConfusables.filter(isLatinConfusable));
await writeAsciiNeighborConfusables(
  asciiConfusables.filter(isAsciiNeighborConfusable),
);
await writeStandardizedVariationSequences(
  collectStandardizedVariationSequences(standardizedVariantsData),
);
await writeScripts(collectScripts(aliasesData));
