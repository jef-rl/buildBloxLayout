import type { StoredProject } from '../types/index';

const INDEX_KEY = 'lit-evaluator:local-project-index';
const PREFIX = 'lit-evaluator:project:';

function readIndex(): string[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(list)) return [];
    return list.filter((x) => typeof x === 'string');
  } catch {
    return [];
  }
}

function writeIndex(list: string[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(Array.from(new Set(list)).sort()));
}

export function listLocalProjects(): string[] {
  return readIndex();
}

export function saveLocalProject(name: string, project: StoredProject) {
  const safeName = name.trim() || 'Untitled Project';
  localStorage.setItem(PREFIX + safeName, JSON.stringify(project));
  const idx = readIndex();
  if (!idx.includes(safeName)) {
    idx.push(safeName);
    writeIndex(idx);
  }
}

export function loadLocalProject(name: string): StoredProject | null {
  const raw = localStorage.getItem(PREFIX + name);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredProject;
  } catch {
    return null;
  }
}

export function deleteLocalProject(name: string) {
  localStorage.removeItem(PREFIX + name);
  const idx = readIndex().filter((n) => n !== name);
  writeIndex(idx);
}
