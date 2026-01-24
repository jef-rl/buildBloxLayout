import type { EffectRegistry } from '../core/registry/effect-registry';
import type { HandlerAction } from '../core/registry/handler-registry';
import type { FrameworkContextState } from '../domains/workspace/handlers/registry';
import type { FrameworkMenuConfig } from '../types/state';
import { frameworkMenuPersistence } from '../utils/framework-menu-persistence';
import { getFrameworkLogger } from '../utils/logger';

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
        source: 'effects/framework-menu',
      },
    },
  ]);
};

export const registerFrameworkMenuEffects = (
  registry: EffectRegistry<FrameworkContextState>,
): void => {
  registry.register('effects/frameworkMenu/save', (_context, action, _dispatch) => {
    const payload = (action.payload ?? {}) as { config?: FrameworkMenuConfig };
    if (!payload.config) {
      return;
    }
    try {
      frameworkMenuPersistence.save(payload.config);
    } catch (error) {
      const logger = getFrameworkLogger();
      logger?.warn?.('Framework menu save failed in effect.', { error });
    }
  });

  registry.register('effects/frameworkMenu/hydrate', (_context, _action, dispatch) => {
    const loadedConfig = frameworkMenuPersistence.load();
    if (!loadedConfig) {
      dispatchLog(dispatch, 'warn', 'No framework menu config loaded from localStorage.');
    }
    dispatch([
      {
        type: 'frameworkMenu/hydrate',
        payload: { config: loadedConfig ?? frameworkMenuPersistence.getDefaultConfig() },
      },
    ]);
  });
};
