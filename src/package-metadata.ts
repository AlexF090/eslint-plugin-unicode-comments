import { readFileSync } from 'node:fs';
import { isRecord } from './core/is-record.ts';

export interface PackageMetadata {
  name: string;
  version: string;
  /** Web address of the repository, such as `https://github.com/owner/name`. */
  repositoryUrl: string;
}

const readString = (owner: unknown, key: string): string | undefined => {
  const value = isRecord(owner) ? owner[key] : undefined;
  return typeof value === 'string' ? value : undefined;
};

/** `git+https://host/owner/name.git` becomes `https://host/owner/name`. */
const toWebUrl = (repositoryUrl: string): string =>
  repositoryUrl.replace(/^git\+/u, '').replace(/\.git$/u, '');

/** Reads name, version, and repository from the package manifest next to `dist/` (or `src/` in tests). */
export const readPackageMetadata = (): PackageMetadata => {
  const manifestUrl = new URL('../package.json', import.meta.url);
  const manifest: unknown = JSON.parse(readFileSync(manifestUrl, 'utf8'));
  const name = readString(manifest, 'name');
  const version = readString(manifest, 'version');
  const repositoryUrl = readString(
    isRecord(manifest) ? manifest['repository'] : undefined,
    'url',
  );
  if (
    name === undefined ||
    version === undefined ||
    repositoryUrl === undefined
  ) {
    throw new Error(
      `${manifestUrl.pathname} is missing a string "name", "version", or "repository.url" field.`,
    );
  }
  return { name, version, repositoryUrl: toWebUrl(repositoryUrl) };
};
