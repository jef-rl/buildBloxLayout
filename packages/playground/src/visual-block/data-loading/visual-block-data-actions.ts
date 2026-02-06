import type { VisualBlockDataDefinitionDTO } from './visual-block-data-dto';

export const VISUAL_BLOCK_DATA_REQUESTED = 'VisualBlockDataRequested';
export const VISUAL_BLOCK_DATA_LOADED = 'VisualBlockDataLoaded';
export const VISUAL_BLOCK_DATA_LOAD_FAILED = 'VisualBlockDataLoadFailed';

export interface VisualBlockDataRequestedAction {
  action: typeof VISUAL_BLOCK_DATA_REQUESTED;
  payload: {
    sourceId: string;
    params?: Record<string, unknown>;
  };
}

export interface VisualBlockDataLoadedAction {
  action: typeof VISUAL_BLOCK_DATA_LOADED;
  payload: {
    sourceId: string;
    definition: VisualBlockDataDefinitionDTO;
  };
}

export interface VisualBlockDataLoadFailedAction {
  action: typeof VISUAL_BLOCK_DATA_LOAD_FAILED;
  payload: {
    sourceId: string;
    error: string;
  };
}

export type VisualBlockDataActions =
  | VisualBlockDataRequestedAction
  | VisualBlockDataLoadedAction
  | VisualBlockDataLoadFailedAction;

export function visualBlockDataRequested(
  sourceId: string,
  params?: Record<string, unknown>,
): VisualBlockDataRequestedAction {
  return {
    action: VISUAL_BLOCK_DATA_REQUESTED,
    payload: {
      sourceId,
      params,
    },
  };
}

export function visualBlockDataLoaded(
  sourceId: string,
  definition: VisualBlockDataDefinitionDTO,
): VisualBlockDataLoadedAction {
  return {
    action: VISUAL_BLOCK_DATA_LOADED,
    payload: {
      sourceId,
      definition,
    },
  };
}

export function visualBlockDataLoadFailed(
  sourceId: string,
  error: string,
): VisualBlockDataLoadFailedAction {
  return {
    action: VISUAL_BLOCK_DATA_LOAD_FAILED,
    payload: {
      sourceId,
      error,
    },
  };
}
