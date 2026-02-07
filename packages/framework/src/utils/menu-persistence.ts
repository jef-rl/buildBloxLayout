import type { MenuConfig } from '../types/state';

const MENU_STORAGE_KEY = 'buildblox:framework-menu';

const getStorage = (): Storage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};

const readConfig = (): MenuConfig | null => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  const raw = storage.getItem(MENU_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as MenuConfig;
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

const writeConfig = (config: MenuConfig): void => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.setItem(MENU_STORAGE_KEY, JSON.stringify(config));
};

export const menuPersistence = {
  load(): MenuConfig | null {
    return readConfig();
  },
  save(config: MenuConfig): void {
    writeConfig(config);
  },
  getDefaultConfig(): MenuConfig {
    return { items: [] };
  },
};
