import type { VisualBlockDataDefinitionDTO } from './visual-block-data-dto';
import type { VisualBlockDataRequestedAction } from './visual-block-data-actions';
import {
  visualBlockDataLoaded,
  visualBlockDataLoadFailed,
} from './visual-block-data-actions';

export interface VisualBlockDataEffectDeps {
  fetchJson: (url: string) => Promise<unknown>;
  dispatch: (action: { action: string; payload: any }) => void;
  buildUrlForSource: (sourceId: string, params?: Record<string, unknown>) => string;
  mapRawToDefinition: (raw: unknown) => VisualBlockDataDefinitionDTO;
  logError?: (message: string, error?: unknown) => void;
}

const resolveErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown visual block data load error.';
};

export function createVisualBlockDataRequestedEffect(deps: VisualBlockDataEffectDeps) {
  return async function handleVisualBlockDataRequested(
    action: VisualBlockDataRequestedAction,
  ): Promise<void> {
    const { sourceId, params } = action.payload;
    try {
      const url = deps.buildUrlForSource(sourceId, params);
      const raw = await deps.fetchJson(url);
      const definition = deps.mapRawToDefinition(raw);
      deps.dispatch(visualBlockDataLoaded(sourceId, definition));
    } catch (error) {
      const message = resolveErrorMessage(error);
      if (deps.logError) {
        deps.logError(`Visual block data load failed for source \"${sourceId}\".`, error);
      }
      deps.dispatch(visualBlockDataLoadFailed(sourceId, message));
    }
  };
}
