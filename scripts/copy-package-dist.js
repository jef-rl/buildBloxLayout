import { cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const [packageName] = process.argv.slice(2);

if (!packageName) {
  throw new Error('Package name required. Usage: node scripts/copy-package-dist.js <package>');
}

const sourceDir = path.resolve(repoRoot, 'packages', packageName, 'dist');
const targetDir = path.resolve(repoRoot, 'dist', packageName);

await rm(targetDir, { recursive: true, force: true });
await cp(sourceDir, targetDir, { recursive: true });
