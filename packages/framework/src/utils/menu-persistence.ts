import type { MenuConfig, MenuItem } from '../types/state';
import { logWarn } from '../../nxt/runtime/engine/logging/framework-logger';

const STORAGE_KEY = 'buildblox-menu-config';
const LEGACY_STORAGE_KEY = 'buildblox-framework-menu-config'; // Temporary compatibility key for pre-rename persisted menu data.
const STORAGE_VERSION = 1;

interface PersistedMenuConfig {
  version: number;
  config: MenuConfig;
}

export const menuPersistence = {
  save(config: MenuConfig): void {
    try {
      const data: PersistedMenuConfig = {
        version: STORAGE_VERSION,
        config,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      logWarn('Failed to persist framework menu config.', { error });
    }
  },

  load(): MenuConfig | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return null;
      const data: PersistedMenuConfig = JSON.parse(raw);
      if (data.version !== STORAGE_VERSION) {
        logWarn('Framework menu config version mismatch, clearing stored data');
        this.clear();
        return null;
      }
      return data.config;
    } catch (error) {
      logWarn('Failed to load persisted framework menu config.', { error });
      return null;
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      logWarn('Failed to clear persisted framework menu config.', { error });
    }
  },

  getDefaultConfig(): MenuConfig {
    return {
      version: 1,
      items: [],
    };
  },

  reorderItems(items: MenuItem[], draggedId: string, targetId: string): MenuItem[] {
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
