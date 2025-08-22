# eslint-plugin-unicode-comments

A comprehensive ESLint plugin that provides Unicode security checks to prevent various Unicode-based attacks and ensure code safety.

## Installation

```bash
npm install eslint-plugin-unicode-comments --save-dev
```

## Usage

```javascript
// In eslint.config.js (ESLint 8+)
const unicodeCommentsPlugin = require("eslint-plugin-unicode-comments");

// Or in .eslintrc.js (ESLint 7)
module.exports = {
  plugins: ["unicode-comments"],
  rules: {
    "unicode-comments/dangerous-unicode": "error",
    "unicode-comments/dangerous-unicode-literals": "error",
    "unicode-comments/dangerous-unicode-template-literals": "error",
    "unicode-comments/dangerous-unicode-identifiers": "error",
  },
};

module.exports = [
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

## Development

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Lint source code
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
