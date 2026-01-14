import type { LitElement } from 'lit';
import type { ToolbarPositionDetail } from '../state/event-types';

type PositionPickerLike = LitElement & { toolbar: string; currentPos: string; occupiedPositions: string[] };

export function createPositionPickerHandlers(component: PositionPickerLike) {
  const stopClickPropagation = (event: Event) => event.stopPropagation();

  const setPosition = (pos: string) => {
    component.dispatchEvent(
      new CustomEvent<ToolbarPositionDetail>('position-selected', {
        detail: { toolbarId: component.toolbar, position: pos },
        bubbles: true,
        composed: true,
      }),
    );
  };

  const getDotState = (pos: string) => {
    const isCurrent = pos === component.currentPos;
    const isOccupied = component.occupiedPositions?.includes(pos);
    return { isCurrent, isOccupied, clickHandler: !isCurrent && !isOccupied ? () => setPosition(pos) : null };
  };

  return {
    stopClickPropagation,
    getDotState,
  };
}
