
import { EffectRegistry } from '../registries/effect.registry';
import { frameworkMenuPersistence } from './framework-menu-persistence.utils';
import { HandlerAction } from '../registries/handler.registry';
import { getFrameworkLogger } from '../helpers/logger.utils'
import { FrameworkMenuConfig } from '../types/state.types';
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
