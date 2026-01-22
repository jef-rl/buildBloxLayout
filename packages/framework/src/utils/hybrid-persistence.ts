import type { Firestore } from 'firebase/firestore';
import type { LayoutPreset, LayoutPresets } from '../types/state';
import { presetPersistence } from './persistence';
import { firestorePersistence } from './firestore-persistence';

export interface HybridPersistenceConfig {
  firestore: Firestore;
  userId?: string | null;
}

let isConfigured = false;

export const hybridPersistence = {
  configure(config: HybridPersistenceConfig): void {
    firestorePersistence.initialize(config.firestore, config.userId);
    isConfigured = true;
  },

  isConfigured(): boolean {
    return isConfigured;
  },

  setUserId(userId: string | null): void {
    firestorePersistence.setUserId(userId);
  },

  getUserId(): string | null {
    return firestorePersistence.getUserId();
  },

  saveAll(presets: LayoutPresets): void {
    presetPersistence.saveAll(presets);
    if (isConfigured) {
      firestorePersistence.saveAll(presets).catch((error) => {
        console.warn('Background Firestore sync failed:', error);
      });
    }
  },

  loadAll(): LayoutPresets | null {
    return presetPersistence.loadAll();
  },

  savePreset(name: string, preset: LayoutPreset): void {
    console.log('[HybridPersistence] savePreset called:', { name, isConfigured });
    presetPersistence.savePreset(name, preset);
    if (isConfigured) {
      console.log('[HybridPersistence] Syncing to Firestore...');
      firestorePersistence.savePreset(name, preset).catch((error) => {
        console.warn('Background Firestore sync failed:', error);
      });
    } else {
      console.log('[HybridPersistence] Firestore not configured, skipping sync');
    }
  },

  deletePreset(name: string): void {
    presetPersistence.deletePreset(name);
    if (isConfigured) {
      firestorePersistence.deletePreset(name).catch((error) => {
        console.warn('Background Firestore delete failed:', error);
      });
    }
  },

  renamePreset(oldName: string, newName: string): void {
    const current = presetPersistence.loadAll() ?? {};
    const preset = current[oldName];
    if (preset) {
      delete current[oldName];
      current[newName] = { ...preset, name: newName };
      presetPersistence.saveAll(current);

      if (isConfigured) {
        firestorePersistence.renamePreset(oldName, newName).catch((error) => {
          console.warn('Background Firestore rename failed:', error);
        });
      }
    }
  },

  clear(): void {
    presetPersistence.clear();
    if (isConfigured) {
      firestorePersistence.clear().catch((error) => {
        console.warn('Background Firestore clear failed:', error);
      });
    }
  },

  async syncFromFirestore(): Promise<LayoutPresets | null> {
    if (!isConfigured) {
      return null;
    }
    return firestorePersistence.loadAll();
  },

  async syncToFirestore(): Promise<void> {
    if (!isConfigured) {
      return;
    }
    const localPresets = presetPersistence.loadAll();
    if (localPresets) {
      await firestorePersistence.saveAll(localPresets);
    }
  },

  async mergeFromFirestore(): Promise<LayoutPresets | null> {
    if (!isConfigured) {
      return presetPersistence.loadAll();
    }

    const localPresets = presetPersistence.loadAll() ?? {};
    const firestorePresets = await firestorePersistence.loadAll();

    if (!firestorePresets) {
      return Object.keys(localPresets).length > 0 ? localPresets : null;
    }

    const merged: LayoutPresets = { ...firestorePresets, ...localPresets };
    presetPersistence.saveAll(merged);

    return merged;
  },

  onPresetsChanged(callback: (presets: LayoutPresets) => void): () => void {
    if (!isConfigured) {
      return () => {};
    }

    return firestorePersistence.onPresetsChanged((firestorePresets) => {
      const localPresets = presetPersistence.loadAll() ?? {};
      const merged = { ...firestorePresets, ...localPresets };
      presetPersistence.saveAll(merged);
      callback(merged);
    });
  },
};
