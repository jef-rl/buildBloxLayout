import type { EffectRegistry } from '../legacy/registry/effect-registry';
import type { HandlerAction } from '../core/registry/HandlerAction.type';
import type { FrameworkContextState } from '../domains/workspace/handlers/registry';
import type { FrameworkMenuConfig } from '../types/state';
import { ActionCatalog } from '../nxt/runtime/actions/action-catalog';
import { frameworkMenuPersistence } from '../utils/framework-menu-persistence';
import { logWarn } from '../nxt/runtime/engine/logging/framework-logger';

const dispatchLog = (
  dispatch: (actions: HandlerAction[]) => void,
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>,
) => {
  dispatch([
    {
      type: ActionCatalog.LogsAppend,
      payload: {
        level,
        message,
        data,
        source: 'effects/framework-menu',
      },
    },
  ]);
};

export const registerFrameworkMenuEffects = (
  registry: EffectRegistry<FrameworkContextState>,
): void => {
  registry.register(ActionCatalog.EffectsFrameworkMenuSave, (_context, action, _dispatch) => {
    const payload = (action.payload ?? {}) as { config?: FrameworkMenuConfig };
    if (!payload.config) {
      return;
    }
    try {
      frameworkMenuPersistence.save(payload.config);
    } catch (error) {
      logWarn('Framework menu save failed in effect.', { error });
    }
  });

  registry.register(ActionCatalog.EffectsFrameworkMenuHydrate, (_context, _action, dispatch) => {
    const loadedConfig = frameworkMenuPersistence.load();
    if (!loadedConfig) {
      dispatchLog(dispatch, 'warn', 'No framework menu config loaded from localStorage.');
    }
    dispatch([
      {
        type: ActionCatalog.FrameworkMenuHydrate,
        payload: { config: loadedConfig ?? frameworkMenuPersistence.getDefaultConfig() },
      },
    ]);
  });
};
