export interface TypographicCharacter {
  name: string;
  replacement: string;
}

/**
 * Typographic characters that word processors and language models insert
 * where a developer would type ASCII, with the ASCII text that replaces them.
 */
export const typographicCharacters: ReadonlyMap<number, TypographicCharacter> =
  new Map([
    // Hyphens and dashes
    [0x2010, { name: 'HYPHEN', replacement: '-' }],
    [0x2011, { name: 'NON-BREAKING HYPHEN', replacement: '-' }],
    [0x2012, { name: 'FIGURE DASH', replacement: '-' }],
    [0x2013, { name: 'EN DASH', replacement: '-' }],
    [0x2014, { name: 'EM DASH', replacement: '--' }],
    [0x2015, { name: 'HORIZONTAL BAR', replacement: '--' }],
    [0x2212, { name: 'MINUS SIGN', replacement: '-' }],
    [0xfe58, { name: 'SMALL EM DASH', replacement: '--' }],
    [0xfe63, { name: 'SMALL HYPHEN-MINUS', replacement: '-' }],
    [0xff0d, { name: 'FULLWIDTH HYPHEN-MINUS', replacement: '-' }],

    // Quotation marks and primes
    [0x2018, { name: 'LEFT SINGLE QUOTATION MARK', replacement: "'" }],
    [0x2019, { name: 'RIGHT SINGLE QUOTATION MARK', replacement: "'" }],
    [0x201a, { name: 'SINGLE LOW-9 QUOTATION MARK', replacement: "'" }],
    [
      0x201b,
      { name: 'SINGLE HIGH-REVERSED-9 QUOTATION MARK', replacement: "'" },
    ],
    [0x201c, { name: 'LEFT DOUBLE QUOTATION MARK', replacement: '"' }],
    [0x201d, { name: 'RIGHT DOUBLE QUOTATION MARK', replacement: '"' }],
    [0x201e, { name: 'DOUBLE LOW-9 QUOTATION MARK', replacement: '"' }],
    [
      0x201f,
      { name: 'DOUBLE HIGH-REVERSED-9 QUOTATION MARK', replacement: '"' },
    ],
    [
      0x2039,
      { name: 'SINGLE LEFT-POINTING ANGLE QUOTATION MARK', replacement: "'" },
    ],
    [
      0x203a,
      { name: 'SINGLE RIGHT-POINTING ANGLE QUOTATION MARK', replacement: "'" },
    ],
    [
      0x00ab,
      { name: 'LEFT-POINTING DOUBLE ANGLE QUOTATION MARK', replacement: '"' },
    ],
    [
      0x00bb,
      { name: 'RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK', replacement: '"' },
    ],
    [0x2032, { name: 'PRIME', replacement: "'" }],
    [0x2033, { name: 'DOUBLE PRIME', replacement: '"' }],

    // Ellipsis and bullets
    [0x2026, { name: 'HORIZONTAL ELLIPSIS', replacement: '...' }],
    [0x2022, { name: 'BULLET', replacement: '-' }],
    [0x2023, { name: 'TRIANGULAR BULLET', replacement: '-' }],
    [0x2043, { name: 'HYPHEN BULLET', replacement: '-' }],

    // Arrows and operators
    [0x2190, { name: 'LEFTWARDS ARROW', replacement: '<-' }],
    [0x2192, { name: 'RIGHTWARDS ARROW', replacement: '->' }],
    [0x2194, { name: 'LEFT RIGHT ARROW', replacement: '<->' }],
    [0x21d0, { name: 'LEFTWARDS DOUBLE ARROW', replacement: '<=' }],
    [0x21d2, { name: 'RIGHTWARDS DOUBLE ARROW', replacement: '=>' }],
    [0x21d4, { name: 'LEFT RIGHT DOUBLE ARROW', replacement: '<=>' }],
    [0x2260, { name: 'NOT EQUAL TO', replacement: '!=' }],
    [0x2264, { name: 'LESS-THAN OR EQUAL TO', replacement: '<=' }],
    [0x2265, { name: 'GREATER-THAN OR EQUAL TO', replacement: '>=' }],
    [0x00d7, { name: 'MULTIPLICATION SIGN', replacement: 'x' }],
  ]);
