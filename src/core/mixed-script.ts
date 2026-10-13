/**
 * Mixed-script detection inspired by UTS #39 "Highly Restrictive": a word may
 * use one script, or Latin combined with the scripts commonly written
 * together in Chinese, Japanese, and Korean text. Anything else (Latin plus
 * Cyrillic, Greek plus Latin, ...) is the shape of a homograph attack.
 */

import { unicodeScripts } from './unicode-scripts.ts';

const commonlyConfusedScripts = [
  'Latin',
  'Cyrillic',
  'Greek',
  'Armenian',
  'Georgian',
  'Cherokee',
  'Coptic',
  'Lisu',
  'Canadian_Aboriginal',
  'Tifinagh',
  'Vai',
  'Osage',
  'Deseret',
  'Runic',
  'Hebrew',
  'Arabic',
  'Syriac',
  'Thaana',
  'Nko',
  'Ethiopic',
  'Devanagari',
  'Bengali',
  'Gurmukhi',
  'Gujarati',
  'Oriya',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Sinhala',
  'Thai',
  'Lao',
  'Tibetan',
  'Myanmar',
  'Khmer',
  'Mongolian',
  'Han',
  'Hiragana',
  'Katakana',
  'Bopomofo',
  'Hangul',
] as const;

const createScriptPattern = (script: string): RegExp | undefined => {
  try {
    return new RegExp(`^\\p{Script=${script}}$`, 'u');
  } catch {
    // Scripts newer than the Unicode version of this JavaScript engine.
    return undefined;
  }
};

// Commonly confused scripts are tested first; the rest of the Unicode
// scripts follow so that any two scripts in one word can be told apart.
const scriptPatterns = [
  ...new Set<string>([...commonlyConfusedScripts, ...unicodeScripts]),
].flatMap((script) => {
  const pattern = createScriptPattern(script);
  return pattern === undefined ? [] : [[script, pattern] as const];
});

const neutralCharacterPattern = /^[\p{Script=Common}\p{Script=Inherited}]$/u;

const allowedScriptCombinations: ReadonlyArray<ReadonlySet<string>> = [
  new Set(['Latin', 'Han', 'Hiragana', 'Katakana']),
  new Set(['Latin', 'Han', 'Bopomofo']),
  new Set(['Latin', 'Han', 'Hangul']),
];

const OTHER_SCRIPT = 'Other';

/** Script name of a character, `undefined` for script-neutral characters (digits, marks, underscore). */
export const getScript = (character: string): string | undefined => {
  if (neutralCharacterPattern.test(character)) {
    return undefined;
  }
  for (const [script, pattern] of scriptPatterns) {
    if (pattern.test(character)) {
      return script;
    }
  }
  return OTHER_SCRIPT;
};

export interface MixedScriptCharacter {
  /** Offset relative to the start of the word. */
  offset: number;
  character: string;
  script: string;
}

export interface MixedScriptResult {
  dominantScript: string;
  foreignCharacters: MixedScriptCharacter[];
}

const isAllowedCombination = (scripts: ReadonlySet<string>): boolean =>
  scripts.size <= 1 ||
  allowedScriptCombinations.some((combination) =>
    [...scripts].every((script) => combination.has(script)),
  );

const pickDominantScript = (scriptCounts: Map<string, number>): string => {
  let dominantScript = OTHER_SCRIPT;
  let highestCount = -1;
  for (const [script, count] of scriptCounts) {
    const winsTieAsLatin = count === highestCount && script === 'Latin';
    if (count > highestCount || winsTieAsLatin) {
      dominantScript = script;
      highestCount = count;
    }
  }
  return dominantScript;
};

/**
 * Returns the characters of `word` that do not belong to its dominant
 * script, or `undefined` when the word uses an accepted script combination.
 * On a tie, Latin is treated as dominant so the non-Latin lookalikes are
 * the ones reported.
 */
export const findMixedScriptCharacters = (
  word: string,
): MixedScriptResult | undefined => {
  const characters: MixedScriptCharacter[] = [];
  const scriptCounts = new Map<string, number>();
  let offset = 0;

  for (const character of word) {
    const script = getScript(character);
    if (script !== undefined) {
      characters.push({ offset, character, script });
      scriptCounts.set(script, (scriptCounts.get(script) ?? 0) + 1);
    }
    offset += character.length;
  }

  if (isAllowedCombination(new Set(scriptCounts.keys()))) {
    return undefined;
  }

  const dominantScript = pickDominantScript(scriptCounts);
  return {
    dominantScript,
    foreignCharacters: characters.filter(
      (entry) => entry.script !== dominantScript,
    ),
  };
};
