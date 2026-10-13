# Security policy

## Supported versions

| Package                          | Version | Supported      |
| -------------------------------- | ------- | -------------- |
| `eslint-plugin-unicode-guard`    | 1.x     | yes            |
| `eslint-plugin-unicode-comments` | all     | no, deprecated |

## Reporting a vulnerability

Report vulnerabilities privately through [GitHub security advisories](https://github.com/AlexF090/eslint-plugin-unicode-guard/security/advisories/new). Do not open a public issue.

A bypass counts as a vulnerability: a character or sequence that can hide or disguise code or instructions and that the `recommended` preset does not report. Please include:

- the code points involved (for example `U+3164`), not only a pasted sample, since pasting may alter invisible characters
- the file type and context (identifier, string, comment, prose)
- the ESLint, Node.js, and plugin versions

You can expect an acknowledgement within seven days. Fixed bypasses are added to the regression corpus in `tests/attacks/`.

## Release integrity

Releases are published from GitHub Actions through npm Trusted Publishing with provenance. Verify a release with:

```sh
npm audit signatures
```
