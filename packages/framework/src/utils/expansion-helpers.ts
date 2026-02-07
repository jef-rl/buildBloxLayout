import type { LayoutExpansionState } from '../types/state';

export type ExpanderState = LayoutExpansionState;

export const isExpanderPanelOpen = (state?: ExpanderState | null): boolean => {
  return state === 'Opened' || state === 'Expanded';
};
