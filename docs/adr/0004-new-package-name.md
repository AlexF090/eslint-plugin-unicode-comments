# 0004: Publish as eslint-plugin-unicode-guard and deprecate the old package

- Status: accepted
- Date: 2026-10-13

## Context

The name `eslint-plugin-unicode-comments` describes the first version, which only checked comments. The rewrite checks every character in every file type, changes all rule names, and changes the configuration format. Keeping the old name would hide a complete break behind a version number.

## Decision

- The rewrite is published as `eslint-plugin-unicode-guard`, starting at `1.0.0`, with the rule prefix `unicode-guard/`.
- Development continues in the same Git repository, which is renamed to `eslint-plugin-unicode-guard`. GitHub redirects the old URLs, and the history stays available.
- After `1.0.0` is published, `eslint-plugin-unicode-comments` is marked deprecated on npm with a pointer to the new package and to `MIGRATION.md`. No further releases of the old package are planned.

## Consequences

- The first publish of the new package has to be done manually by the maintainer, because npm Trusted Publishing can only be configured for a package that already exists. All later releases go through `release.yml`.
- Existing users get a deprecation warning on install and a migration guide that maps every old rule to its replacement.
