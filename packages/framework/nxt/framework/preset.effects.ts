
import { EffectRegistry } from '../registries/effect.registry';
import { HandlerAction } from '../registries/handler.registry';
import { hybridPersistence } from './hybrid-persistence.utils';
import { getFrameworkLogger } from '../helpers/logger.utils'
import { presetPersistence } from './persistence.utils';
import { LayoutPreset, LayoutPresets } from '../types/state.types';
import { FrameworkContextState } from '../workspace/workspace-registry.handlers';

const dispatchLog = (
  dispatch: (actions: HandlerAction[]) => void,
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>,
) => {
  dispatch([
    {
      type: 'logs/append',
      payload: {
        level,
        message,
        data,
        source: 'effects/presets',
      },
    },
  ]);
};

export const registerPresetEffects = (
  registry: EffectRegistry<FrameworkContextState>,
): void => {
  registry.register('effects/presets/save', (_context, action, _dispatch) => {
    const payload = (action.payload ?? {}) as { name?: string; preset?: LayoutPreset };
    if (!payload.name || !payload.preset) {
      return;
    }
    try {
      hybridPersistence.savePreset(payload.name, payload.preset);
    } catch (error) {
      const logger = getFrameworkLogger();
      logger?.warn?.('Preset save failed in effect.', { error });
    }
  });

  registry.register('effects/presets/delete', (_context, action, _dispatch) => {
    const payload = (action.payload ?? {}) as { name?: string };
    if (!payload.name) {
      return;
    }
    try {
      hybridPersistence.deletePreset(payload.name);
    } catch (error) {
      const logger = getFrameworkLogger();
      logger?.warn?.('Preset delete failed in effect.', { error });
    }
  });

  registry.register('effects/presets/rename', (_context, action, _dispatch) => {
    const payload = (action.payload ?? {}) as { oldName?: string; newName?: string };
    if (!payload.oldName || !payload.newName) {
      return;
    }
    try {
      hybridPersistence.renamePreset(payload.oldName, payload.newName);
    } catch (error) {
      const logger = getFrameworkLogger();
      logger?.warn?.('Preset rename failed in effect.', { error });
    }
  });

  registry.register('effects/presets/hydrate', (_context, _action, dispatch) => {
    const loadedPresets = presetPersistence.loadAll();
    if (!loadedPresets) {
      dispatchLog(dispatch, 'warn', 'No presets loaded from localStorage.');
      return;
    }

    dispatch([
      {
        type: 'presets/hydrate',
        payload: { presets: loadedPresets as LayoutPresets },
      },
    ]);
    dispatchLog(dispatch, 'info', 'Presets loaded from localStorage.', {
      count: Object.keys(loadedPresets).length,
    });
  });
};
