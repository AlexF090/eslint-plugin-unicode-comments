import { readFileSync } from 'node:fs';

export interface PackageMetadata {
  name: string;
  version: string;
}

const isPackageMetadata = (value: unknown): value is PackageMetadata =>
  typeof value === 'object' &&
  value !== null &&
  typeof Reflect.get(value, 'name') === 'string' &&
  typeof Reflect.get(value, 'version') === 'string';

/** Reads name and version from the package manifest next to `dist/` (or `src/` in tests). */
export const readPackageMetadata = (): PackageMetadata => {
  const manifestUrl = new URL('../package.json', import.meta.url);
  const manifest: unknown = JSON.parse(readFileSync(manifestUrl, 'utf8'));
  if (!isPackageMetadata(manifest)) {
    throw new Error(
      `${manifestUrl.pathname} is missing a string "name" or "version" field.`,
    );
  }
  return { name: manifest.name, version: manifest.version };
};
