import type { LayoutPresets } from '../types/state';

const PRESET_STORAGE_KEY = 'buildblox:layout-presets';

const getStorage = (): Storage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};

const readPresets = (): LayoutPresets | null => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  const raw = storage.getItem(PRESET_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as LayoutPresets;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

const writePresets = (presets: LayoutPresets): void => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
};

export const presetPersistence = {
  loadAll(): LayoutPresets | null {
    return readPresets();
  },
  saveAll(presets: LayoutPresets): void {
    writePresets(presets);
  },
};
