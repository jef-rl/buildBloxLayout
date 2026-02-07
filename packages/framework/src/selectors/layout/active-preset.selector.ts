import type { SelectorImpl } from '../../runtime/registries/selectors/selector-impl-registry';
import type { UIState } from '../../types/state';

export const activePresetSelectorKey = 'selector:layout/activePreset';

export const activePresetSelectorImpl: SelectorImpl<UIState, string | null> = (state) => {
  return state.layout?.activePreset ?? null;
};
