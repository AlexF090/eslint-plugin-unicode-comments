# eslint-plugin-unicode-comments

A comprehensive ESLint plugin that provides Unicode security checks to prevent various Unicode-based attacks and ensure code safety.

## Installation

```bash
npm install eslint-plugin-unicode-comments --save-dev
```

## Usage

### ESLint 9+ (Flat Config)

```javascript
// eslint.config.js
import unicodeCommentsPlugin from "eslint-plugin-unicode-comments";

export default [
  {
    plugins: {
      "unicode-comments": unicodeCommentsPlugin,
    },
    rules: {
      "unicode-comments/dangerous-unicode": "error",
      "unicode-comments/dangerous-unicode-literals": "error",
      "unicode-comments/dangerous-unicode-template-literals": "error",
      "unicode-comments/dangerous-unicode-identifiers": "error",
    },
  },
];
```

### ESLint 8 and below (Legacy Config)

```javascript
// .eslintrc.js
module.exports = {
  plugins: ["unicode-comments"],
  rules: {
    "unicode-comments/dangerous-unicode": "error",
    "unicode-comments/dangerous-unicode-literals": "error",
    "unicode-comments/dangerous-unicode-template-literals": "error",
    "unicode-comments/dangerous-unicode-identifiers": "error",
  },
};
```

### Using Recommended Config

```javascript
// ESLint 9+ (Flat Config)
import unicodeCommentsPlugin from "eslint-plugin-unicode-comments";

export default [
  {
    plugins: {
      "unicode-comments": unicodeCommentsPlugin,
    },
    ...unicodeCommentsPlugin.configs.recommended,
  },
];

// ESLint 8 and below (Legacy Config)
module.exports = {
  extends: ["plugin:unicode-comments/recommended"],
};
```

## Rules

- `dangerous-unicode`: Detects dangerous Unicode characters in comments
- `dangerous-unicode-literals`: Prevents dangerous Unicode in string literals
- `dangerous-unicode-template-literals`: Blocks dangerous Unicode in template literals
- `dangerous-unicode-identifiers`: Identifies dangerous Unicode in identifiers

## Features

- Trojan Source attack prevention
- Homograph attack detection
- Unicode hyphen/dash blocking
- Invisible character detection
- Mathematical symbol blocking
- Fullwidth ASCII variant prevention
- Unicode quotation mark blocking

## Blocked Characters

The plugin blocks the following dangerous Unicode characters:

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
