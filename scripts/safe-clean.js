/**
 * Safely remove build/cache directories.
 *
 * Only paths on the allowlist below are eligible for deletion. Each target is
 * resolved from the project root and verified to stay inside it before removal.
 *
 * Usage:
 *   npm run clean
 *   npm run clean:dry-run
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

/** Relative paths that `npm run clean` may remove. Add new entries here only. */
const ALLOWED_TARGETS = ['dist', 'node_modules/.vite'];

const DRY_RUN = process.argv.includes('--dry-run') || process.env.CLEAN_DRY_RUN === '1';

function assertSafeTarget(relativeTarget) {
  if (!relativeTarget || relativeTarget.startsWith('/') || /^[A-Za-z]:/.test(relativeTarget)) {
    throw new Error(`Refusing unsafe target (must be a relative path): ${relativeTarget}`);
  }

  if (relativeTarget.includes('..')) {
    throw new Error(`Refusing target with path traversal: ${relativeTarget}`);
  }

  const normalized = path.normalize(relativeTarget);
  if (normalized === '.' || normalized === '..' || normalized === '') {
    throw new Error(`Refusing unsafe target: ${relativeTarget}`);
  }

  const absoluteTarget = path.resolve(PROJECT_ROOT, normalized);
  const relativeToRoot = path.relative(PROJECT_ROOT, absoluteTarget);

  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    throw new Error(`Refusing target outside project root: ${relativeTarget}`);
  }

  if (normalized === 'node_modules' || relativeToRoot === 'node_modules') {
    throw new Error('Refusing to delete node_modules. Only node_modules/.vite is allowed.');
  }

  return absoluteTarget;
}

async function removeTarget(relativeTarget) {
  const absoluteTarget = assertSafeTarget(relativeTarget);

  if (!fs.existsSync(absoluteTarget)) {
    console.log(`skip (not found): ${relativeTarget}`);
    return;
  }

  const stat = fs.lstatSync(absoluteTarget);
  if (!stat.isDirectory()) {
    throw new Error(`Refusing to delete non-directory: ${relativeTarget}`);
  }

  if (DRY_RUN) {
    console.log(`dry-run: would delete ${relativeTarget}`);
    return;
  }

  await fs.promises.rm(absoluteTarget, { recursive: true, force: true, maxRetries: 3 });
  console.log(`deleted: ${relativeTarget}`);
}

async function main() {
  console.log(`Project root: ${PROJECT_ROOT}`);
  if (DRY_RUN) {
    console.log('Dry run enabled — no files will be deleted.');
  }

  for (const target of ALLOWED_TARGETS) {
    await removeTarget(target);
  }

  console.log('Clean complete.');
}

main().catch(error => {
  console.error(`Clean failed: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
