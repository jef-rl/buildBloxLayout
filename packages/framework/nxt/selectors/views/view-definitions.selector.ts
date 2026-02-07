import type { SelectorImpl } from '../../runtime/registries/selectors/selector-impl-registry';
import type { UIState, ViewDefinitionSummary } from '../../../src/types/state';

export const viewDefinitionsSelectorKey = 'selector:view/definitions';

export const viewDefinitionsSelectorImpl: SelectorImpl<UIState, ViewDefinitionSummary[]> = (state) => {
  return state.viewDefinitions ?? [];
};
