import type { UIState } from '../../../types/state';
import type { Action } from '../../runtime/actions/action';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const panelsUpdateReducer = (
  state: UIState,
  action: Action<any>,
  _config?: Record<string, unknown>,
): UIState => {
  const payload = action.payload ?? {};
  const panels = payload.panels as UIState['panels'] | undefined;
  const panelId = payload.panelId as string | undefined;
  const changes = (payload.changes ?? payload.panel ?? payload.value) as unknown;
  let nextPanels = state.panels;

  if (Array.isArray(panels)) {
    nextPanels = panels;
  } else if (panelId && isRecord(changes)) {
    nextPanels = state.panels.map((panel) =>
      panel.id === panelId ? { ...panel, ...changes } : panel,
    );
  }

  return nextPanels === state.panels ? state : { ...state, panels: nextPanels };
};
