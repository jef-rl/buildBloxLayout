import type { LayoutPreset, LayoutPresets } from '../types/state';
import { migrateLegacyExpansion, type LegacyLayoutExpansion } from './expansion-helpers.js';
import { logInfo, logWarn } from '../../nxt/runtime/engine/logging/framework-logger';

const STORAGE_KEY = 'buildblox-layout-presets';
const STORAGE_VERSION = 2;

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

export interface PersistenceOptions {
  skipSync?: boolean;
}

export const presetPersistence = {
  saveAll: (presets: LayoutPresets, options?: PersistenceOptions): void => {
    try {
      logInfo('[Persistence] saveAll called with presets:', { count: Object.keys(presets).length });
      const data: PersistedPresets = {
        version: STORAGE_VERSION,
        presets,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      logInfo('[Persistence] Saved to localStorage with key:', { key: STORAGE_KEY });
      if (!options?.skipSync) {
        firestoreSyncCallback?.(presets);
      }
    } catch (error) {
      logWarn('Failed to persist layout presets.', { error });
    }
  },

  loadAll: (): LayoutPresets | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data: PersistedPresets = JSON.parse(raw);

      // Handle version migration
      if (data.version === 1) {
        // Migrate from version 1 (boolean) to version 2 (string)
        const migratedPresets: LayoutPresets = {};
        for (const [key, preset] of Object.entries(data.presets)) {
          const expansion = preset.expansion as any;
          if (typeof expansion.left === 'boolean') {
            migratedPresets[key] = {
              ...preset,
              expansion: migrateLegacyExpansion(expansion as LegacyLayoutExpansion),
            };
          } else {
            migratedPresets[key] = preset;
          }
        }
        // Save migrated version
        presetPersistence.saveAll(migratedPresets);
        return migratedPresets;
      }

      if (data.version !== STORAGE_VERSION) {
        logWarn('Layout presets version mismatch, clearing stored data');
        presetPersistence.clear();
        return null;
      }
      return data.presets;
    } catch (error) {
      logWarn('Failed to load persisted layout presets.', { error });
      return null;
    }
  },

  savePreset: (name: string, preset: LayoutPreset, options?: PersistenceOptions): void => {
    logInfo('[Persistence] savePreset called:', { name });
    const current = presetPersistence.loadAll() ?? {};
    current[name] = preset;
    presetPersistence.saveAll(current, options);
    logInfo('[Persistence] savePreset completed, total presets:', { count: Object.keys(current).length });
  },

  deletePreset: (name: string, options?: PersistenceOptions): void => {
    const current = presetPersistence.loadAll() ?? {};
    delete current[name];
    presetPersistence.saveAll(current, options);
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      logWarn('Failed to clear persisted layout presets.', { error });
    }
  },
};
