import type { LayoutPreset, LayoutPresets } from '../types/state';
import { presetPersistence } from './persistence';

let memoryPresets: LayoutPresets = {};

const loadPresets = (): LayoutPresets => {
  const stored = presetPersistence.loadAll();
  if (stored) {
    memoryPresets = stored;
  }
  return memoryPresets;
};

const savePresets = (presets: LayoutPresets): void => {
  memoryPresets = presets;
  presetPersistence.saveAll(presets);
};

export const hybridPersistence = {
  savePreset(name: string, preset: LayoutPreset): void {
    const current = loadPresets();
    const nextPreset = { ...preset, name: preset.name ?? name };
    savePresets({ ...current, [name]: nextPreset });
  },
  renamePreset(oldName: string, newName: string): void {
    const current = loadPresets();
    if (!current[oldName]) {
      return;
    }
    const { [oldName]: existing, ...rest } = current;
    const nextPreset = { ...existing, name: newName };
    savePresets({ ...rest, [newName]: nextPreset });
  },
  deletePreset(name: string): void {
    const current = loadPresets();
    if (!current[name]) {
      return;
    }
    const { [name]: _removed, ...rest } = current;
    savePresets(rest);
  },
};
