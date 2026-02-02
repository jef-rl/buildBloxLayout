import { FrameworkMenuConfig, FrameworkMenuItem } from "./state.types";

const STORAGE_KEY = 'buildblox-framework-menu-config';
const STORAGE_VERSION = 1;

interface PersistedFrameworkMenuConfig {
  version: number;
  config: FrameworkMenuConfig;
}

export const frameworkMenuPersistence = {
  save(config: FrameworkMenuConfig): void {
    try {
      const data: PersistedFrameworkMenuConfig = {
        version: STORAGE_VERSION,
        config,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to persist framework menu config:', error);
    }
  },

  load(): FrameworkMenuConfig | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data: PersistedFrameworkMenuConfig = JSON.parse(raw);
      if (data.version !== STORAGE_VERSION) {
        console.warn('Framework menu config version mismatch, clearing stored data');
        this.clear();
        return null;
      }
      return data.config;
    } catch (error) {
      console.warn('Failed to load persisted framework menu config:', error);
      return null;
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear persisted framework menu config:', error);
    }
  },

  getDefaultConfig(): FrameworkMenuConfig {
    return {
      version: 1,
      items: [],
    };
  },

  reorderItems(items: FrameworkMenuItem[], draggedId: string, targetId: string): FrameworkMenuItem[] {
    const newItems = [...items];
    const draggedIndex = newItems.findIndex((item) => item.id === draggedId);
    const targetIndex = newItems.findIndex((item) => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      return items;
    }

    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);

    return newItems.map((item, index) => ({ ...item, order: index }));
  },
};
