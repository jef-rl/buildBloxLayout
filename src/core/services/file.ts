import type { StoredProject } from '../types';

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function readFileAsText(file: File): Promise<string> {
  return await file.text();
}

export function buildCurrentProjectExport(project: StoredProject): StoredProject {
  return {
    name: project.name || 'Untitled Project',
    tags: Array.isArray(project.tags) ? project.tags : [],
    scope: project.scope ?? '{}',
    template: project.template ?? '',
    styles: project.styles ?? '',
    id: project.id,
  };
}
