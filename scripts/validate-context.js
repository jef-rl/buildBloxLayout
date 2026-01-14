import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

function readProjectFile(filePath) {
  const absolutePath = path.join(process.cwd(), filePath);
  return readFileSync(absolutePath, 'utf8');
}

function listSourceFiles() {
  const output = execSync('git ls-files "src/**/*.ts"', { encoding: 'utf8' });
  return output.split('\n').map((file) => file.trim()).filter(Boolean);
}

function ensureNoDirectReduceCalls(files) {
  const allowed = new Set(['src/handlers/state/ui-context.handlers.ts']);
  const violations = files.filter((file) => !allowed.has(file))
    .filter((file) => readProjectFile(file).includes('uiProvider.reduce'));

  if (violations.length) {
    throw new Error(`uiProvider.reduce should only be used in centralized handlers. Found in: ${violations.join(', ')}`);
  }
}

function ensureWorkspaceRootIsReadOnly() {
  const workspaceRootPath = 'src/features/workspace/workspace-root.ts';
  const content = readProjectFile(workspaceRootPath);
  if (/_uiState\s*=/.test(content)) {
    throw new Error('workspace-root should not mutate context state directly (found _uiState assignments).');
  }
}

function ensureContextConsumersAreReadonly(files) {
  const consumerFiles = files.filter((file) => readProjectFile(file).includes('uiStateContext'));
  const violations = consumerFiles
    .filter((file) => /\.state\s*=/.test(readProjectFile(file)))
    .map((file) => file);

  if (violations.length) {
    throw new Error(`Components should not write to context state. Found writable state usage in: ${violations.join(', ')}`);
  }
}

function main() {
  const files = listSourceFiles();
  ensureNoDirectReduceCalls(files);
  ensureWorkspaceRootIsReadOnly();
  ensureContextConsumersAreReadonly(files);
  console.log('Context validation passed.');
}

main();
