import type { EffectRegistry } from '../legacy/registry/effect-registry';
import type { HandlerAction } from '../core/registry/HandlerAction.type';
import type { FrameworkContextState } from '../domains/workspace/handlers/registry';
import type { MenuConfig } from '../types/state';
import { ActionCatalog } from '../nxt/runtime/actions/action-catalog';
import { menuPersistence } from '../utils/menu-persistence';
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
        source: 'effects/menu',
      },
    },
  ]);
};

export const registerMenuEffects = (
  registry: EffectRegistry<FrameworkContextState>,
): void => {
  registry.register(ActionCatalog.EffectsMenuSave, (_context, action, _dispatch) => {
    const payload = (action.payload ?? {}) as { config?: MenuConfig };
    if (!payload.config) {
      return;
    }
    try {
      menuPersistence.save(payload.config);
    } catch (error) {
      logWarn('Framework menu save failed in effect.', { error });
    }
  });

  registry.register(ActionCatalog.EffectsMenuHydrate, (_context, _action, dispatch) => {
    const loadedConfig = menuPersistence.load();
    if (!loadedConfig) {
      dispatchLog(dispatch, 'warn', 'No framework menu config loaded from localStorage.');
    }
    dispatch([
      {
        type: ActionCatalog.MenuHydrate,
        payload: { config: loadedConfig ?? menuPersistence.getDefaultConfig() },
      },
    ]);
  });
};
