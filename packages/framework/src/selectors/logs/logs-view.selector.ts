import type { SelectorImpl } from '../../runtime/registries/selectors/selector-impl-registry';
import type { UIState } from '../../types/state';

export type LogsViewData = {
  entries: UIState['logs']['entries'];
  maxEntries: number;
};

export const logsViewSelectorKey = 'selector:logs/view';

export const logsViewSelectorImpl: SelectorImpl<UIState, LogsViewData> = (state) => {
  const logs = state.logs ?? { entries: [], maxEntries: 0 };
  return {
    entries: logs.entries ?? [],
    maxEntries: logs.maxEntries ?? 0,
  };
};
