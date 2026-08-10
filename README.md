# eslint-plugin-unicode-comments

A comprehensive ESLint plugin that flags dangerous and suspicious Unicode characters in your code — catching both security risks (Trojan Source, homograph attacks) and typographic tells of unedited AI-generated code (em dashes, curly quotes, ellipsis characters, non-breaking spaces).

## Installation

### From npm (when published)

```bash
npm install eslint-plugin-unicode-comments --save-dev
```

### Local Development Installation

```bash
# Install locally from project directory
npm install /path/to/eslint-plugin-unicode-comments
```

## Usage

### ESLint 9+ (Flat Config)

```javascript
// eslint.config.js (CommonJS style)
const unicodeCommentsPlugin = require('eslint-plugin-unicode-comments');

module.exports = [
  {
    plugins: {
      'unicode-comments': unicodeCommentsPlugin,
    },
    rules: {
      'unicode-comments/dangerous-unicode': 'error',
      'unicode-comments/dangerous-unicode-literals': 'error',
      'unicode-comments/dangerous-unicode-template-literals': 'error',
      'unicode-comments/dangerous-unicode-identifiers': 'error',
      'unicode-comments/dangerous-unicode-style': 'warn',
      'unicode-comments/dangerous-unicode-literals-style': 'warn',
      'unicode-comments/dangerous-unicode-template-literals-style': 'warn',
    },
  },
];
```

### ESLint 8 and below (Legacy Config)

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['unicode-comments'],
  rules: {
    'unicode-comments/dangerous-unicode': 'error',
    'unicode-comments/dangerous-unicode-literals': 'error',
    'unicode-comments/dangerous-unicode-template-literals': 'error',
    'unicode-comments/dangerous-unicode-identifiers': 'error',
    'unicode-comments/dangerous-unicode-style': 'warn',
    'unicode-comments/dangerous-unicode-literals-style': 'warn',
    'unicode-comments/dangerous-unicode-template-literals-style': 'warn',
  },
};
```

### Using Recommended Config

```javascript
// ESLint 8 and below (Legacy Config)
module.exports = {
  extends: ['plugin:unicode-comments/recommended'],
};
```

```javascript
// ESLint 9+ (Flat Config)
const unicodeCommentsPlugin = require('eslint-plugin-unicode-comments');

module.exports = [unicodeCommentsPlugin.configs['flat/recommended']];
```

## Rules

Rules are split into two families with different severities in the `recommended` presets, because a Trojan Source attack and a stray em dash are not the same kind of problem:

**Security** (`error`) — Trojan Source, homograph attacks, mathematical alphanumeric spoofing, fullwidth ASCII, invisible/zero-width characters:

- `dangerous-unicode`: Detects dangerous Unicode characters in comments
- `dangerous-unicode-literals`: Prevents dangerous Unicode in string literals
- `dangerous-unicode-template-literals`: Blocks dangerous Unicode in template literals
- `dangerous-unicode-identifiers`: Identifies dangerous Unicode in identifiers

**Style** (`warn`) — typographic tells commonly left behind by unedited AI-generated text (Unicode dashes/quotes, ellipsis, non-breaking/thin/figure space, bullet):

- `dangerous-unicode-style`: Flags typographic artifacts in comments (auto-fixable)
- `dangerous-unicode-literals-style`: Flags typographic artifacts in string literals
- `dangerous-unicode-template-literals-style`: Flags typographic artifacts in template literals

## Features

- Trojan Source attack prevention
- Homograph attack detection
- Invisible character detection
- Mathematical symbol blocking
- Fullwidth ASCII variant prevention
- Typographic AI-generated text tell detection (em/en dash, curly quotes, ellipsis, non-breaking/thin/figure space, bullet) as a separate, lower-severity rule family

## Blocked Characters

The plugin blocks the following dangerous Unicode characters. Hyphens/Dashes, Quotation Marks and Typographic Artifacts below are flagged by the `-style` rules (`warn`); everything else is flagged by the security rules (`error`).

### Hyphens and Dashes:

- `–` (en dash, U+2013) → `-`
- `—` (em dash, U+2014) → `--`
- `‐` (hyphen, U+2010) → `-`
- `‑` (non-breaking hyphen, U+2011) → `-`
- `‒` (figure dash, U+2012) → `-`
- `―` (horizontal bar, U+2015) → `--`
- `−` (minus sign, U+2212) → `-`
- `﹘` (small em dash, U+FE58) → `-`
- `﹣` (small hyphen-minus, U+FE63) → `-`
- `－` (fullwidth hyphen-minus, U+FF0D) → `-`

### Quotation Marks:

- `'` (left single quotation mark, U+2018) → `'`
- `'` (right single quotation mark, U+2019) → `'`
- `"` (left double quotation mark, U+201C) → `"`
- `"` (right double quotation mark, U+201D) → `"`
- `‚` (single low-9 quotation mark, U+201A) → `,`
- `„` (double low-9 quotation mark, U+201E) → `,,`
- `‹` (single left-pointing angle quotation mark, U+2039) → `<`
- `›` (single right-pointing angle quotation mark, U+203A) → `>`

### Typographic Artifacts (common AI-generated text tells):

- `…` (horizontal ellipsis, U+2026) → `...`
- ` ` (non-breaking space, U+00A0) → ` ` (regular space)
- ` ` (thin space, U+2009) → ` ` (regular space)
- ` ` (figure space, U+2007) → ` ` (regular space)
- `•` (bullet, U+2022) → `-`

## Development

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Run tests
npm test

# Lint source code
npm run lint
```

### Local Development Workflow

```bash
# 1. Make changes to source code
# 2. Build the plugin
npm run build

# 3. Install locally in consumer project
cd /path/to/consumer-project
npm install /path/to/eslint-plugin-unicode-comments

# 4. Test the plugin
npx eslint path/to/test-file.js

# 5. Use --fix to test auto-fixing
npx eslint path/to/test-file.js --fix
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
