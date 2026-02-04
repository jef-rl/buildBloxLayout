import type { EffectImpl } from '../../runtime/registries/effects/effect-impl-registry';
import type { LayoutPresets } from '../../../types/state';
import { presetPersistence } from '../../../utils/persistence';
import { dispatchActions, dispatchLog } from './preset-effect-helpers';

export const presetsHydrateImplKey = 'effect:presets/hydrate@1';

export const presetsHydrateEffect: EffectImpl = (_action, dispatch) => {
  const loadedPresets = presetPersistence.loadAll();
  if (!loadedPresets) {
    dispatchLog(dispatch, 'warn', 'No presets loaded from localStorage.');
    return;
  }

  dispatchActions(dispatch, [
    {
      action: 'presets/hydrate',
      payload: { presets: loadedPresets as LayoutPresets },
    },
  ]);
  dispatchLog(dispatch, 'info', 'Presets loaded from localStorage.', {
    count: Object.keys(loadedPresets).length,
  });
};
