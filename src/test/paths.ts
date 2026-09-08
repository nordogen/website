import { fileURLToPath } from 'node:url'

/**
 * Repo-root-relative paths for tests that read content files.
 *
 * Derived from this file's own location, not from `process.cwd()`: a bare
 * relative path resolves against wherever the runner happened to start, which
 * is the repo root for `npx vitest run` but not necessarily for an IDE runner
 * or a run launched from a subdirectory. `path.resolve(process.cwd(), …)` is
 * the same thing spelled longer — it is the same base.
 */
const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url))

export function repoPath(...segments: string[]): string {
  return `${REPO_ROOT}${segments.join('/')}`
}
