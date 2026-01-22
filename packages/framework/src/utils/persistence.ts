import type { LayoutPreset, LayoutPresets } from '../types/state';

const STORAGE_KEY = 'buildblox-layout-presets';
const STORAGE_VERSION = 1;

interface PersistedPresets {
  version: number;
  presets: LayoutPresets;
}

type FirestoreSyncCallback = (presets: LayoutPresets) => void;
let firestoreSyncCallback: FirestoreSyncCallback | null = null;

export const setFirestoreSyncCallback = (
  callback: FirestoreSyncCallback | null
): void => {
  firestoreSyncCallback = callback;
};

export const presetPersistence = {
  saveAll: (presets: LayoutPresets): void => {
    try {
      const data: PersistedPresets = {
        version: STORAGE_VERSION,
        presets,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      firestoreSyncCallback?.(presets);
    } catch (error) {
      console.warn('Failed to persist layout presets:', error);
    }
  },

  loadAll: (): LayoutPresets | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data: PersistedPresets = JSON.parse(raw);
      if (data.version !== STORAGE_VERSION) {
        console.warn('Layout presets version mismatch, clearing stored data');
        presetPersistence.clear();
        return null;
      }
      return data.presets;
    } catch (error) {
      console.warn('Failed to load persisted layout presets:', error);
      return null;
    }
  },

  savePreset: (name: string, preset: LayoutPreset): void => {
    const current = presetPersistence.loadAll() ?? {};
    current[name] = preset;
    presetPersistence.saveAll(current);
  },

  deletePreset: (name: string): void => {
    const current = presetPersistence.loadAll() ?? {};
    delete current[name];
    presetPersistence.saveAll(current);
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear persisted layout presets:', error);
    }
  },
};
