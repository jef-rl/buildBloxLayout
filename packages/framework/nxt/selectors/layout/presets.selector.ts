import type { SelectorImpl } from '../../runtime/registries/selectors/selector-impl-registry';
import type { LayoutPreset, UIState } from '../../../src/types/state';

export const layoutPresetsSelectorKey = 'selector:layout/presets';

export const layoutPresetsSelectorImpl: SelectorImpl<UIState, LayoutPreset[]> = (state) => {
  const presetsMap = state.layout?.presets ?? {};
  return Object.values(presetsMap);
};
