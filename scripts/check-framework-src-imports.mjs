import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const forbiddenFragments = ['packages/framework/src', 'framework/src'];
const extensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.mts',
  '.cts',
]);

const importRegexes = [
  /(import|export)\s+[^;]*?\sfrom\s+['"]([^'"]+)['"]/g,
  /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];

const files = execSync('git ls-files', { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean)
  .filter((file) => extensions.has(path.extname(file)));

const violations = [];

for (const file of files) {
  const contents = fs.readFileSync(file, 'utf8');
  for (const regex of importRegexes) {
    let match;
    while ((match = regex.exec(contents)) !== null) {
      const specifier = match[2] ?? match[1];
      if (!specifier) {
        continue;
      }
      if (forbiddenFragments.some((fragment) => specifier.includes(fragment))) {
        violations.push({ file, specifier });
      }
    }
  }
}

if (violations.length > 0) {
  console.error('Forbidden imports detected. Use packages/framework/nxt instead:');
  for (const violation of violations) {
    console.error(`- ${violation.file}: ${violation.specifier}`);
  }
  process.exit(1);
}

console.log('No forbidden framework/src imports found.');
