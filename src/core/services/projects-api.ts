import type { CloudProjectMeta, StoredProject } from '../types/index';

const DEFAULT_BASE =
  'https://us-central1-lozzuck.cloudfunctions.net/experimental_lozzuckCloudFns/api/v1/projects';

function env(name: string, fallback = ''): string {
  return (import.meta as any).env?.[name] ?? fallback;
}

export class ProjectsApi {
  private baseUrl = env('VITE_PROJECTS_API_BASE', DEFAULT_BASE);
  private apiKey = env('VITE_PROJECTS_API_KEY', '');
  private userId = env('VITE_USER_ID', 'test-user');

  private withKey(url: string) {
    if (!this.apiKey) return url;
    const u = new URL(url);
    u.searchParams.set('key', this.apiKey);
    return u.toString();
  }

  async request<T>(endpoint = '', method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any): Promise<T> {
    const url = this.withKey(this.baseUrl + endpoint);
    const init: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (body && method !== 'GET') {
      const payload = { ...body, userId: this.userId };
      if (typeof payload.tags === 'string') {
        payload.tags = payload.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
      init.body = JSON.stringify(payload);
    }

    const delays = [1000, 2000, 4000];
    for (let i = 0; i <= delays.length; i++) {
      try {
        const res = await fetch(url, init);
        if (res.status === 204 || res.status === 202) return {} as T;

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
          throw new Error(errBody.message || `API Error: ${res.status}`);
        }

        const data = await res.json();
        return (data?.data ?? data) as T;
      } catch (e) {
        if (i === delays.length) throw e;
        await new Promise((r) => setTimeout(r, delays[i]));
      }
    }
    return {} as T;
  }

  async list(): Promise<CloudProjectMeta[]> {
    const q = `?userId=${encodeURIComponent(this.userId)}`;
    return await this.request<CloudProjectMeta[]>(q, 'GET');
  }

  async get(id: string): Promise<StoredProject> {
    return await this.request<StoredProject>(`/${id}`, 'GET');
  }

  async save(project: StoredProject): Promise<StoredProject> {
    const isUpdate = !!project.id;
    const endpoint = isUpdate ? `/${project.id}` : '';
    const method = isUpdate ? 'PUT' : 'POST';
    const body = {
      name: project.name,
      tags: project.tags,
      scope: project.scope,
      template: project.template,
      styles: project.styles,
    };
    return await this.request<StoredProject>(endpoint, method, body);
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/${id}`, 'DELETE');
  }

  getUserId() {
    return this.userId;
  }
}
