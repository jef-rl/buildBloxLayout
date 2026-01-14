import type { LitElement } from 'lit';
import type { ToolbarPositionDetail } from '../state/event-types';
import type { DockManager } from '../../shared/layout/core/dock-manager';

type DockContainerLike = LitElement & {
  manager: DockManager | null;
  toolbarId: string;
};

export function createDockContainerHandlers(component: DockContainerLike) {
  const togglePicker = (event: Event) => {
    event.stopPropagation();
    component.manager?.togglePicker(component.toolbarId);
  };

  const handlePositionChange = (event: CustomEvent<ToolbarPositionDetail | { pos: string }>) => {
    const position = (event.detail as any).position ?? (event.detail as any).pos;
    if (!position) return;
    if (component.manager) component.manager.setPosition(component.toolbarId, position as any);
    component.dispatchEvent(
      new CustomEvent<ToolbarPositionDetail>('toolbar-position-change', {
        detail: { toolbarId: component.toolbarId, position },
        bubbles: true,
        composed: true,
      }),
    );
  };

  const stopClickPropagation = (event: Event) => event.stopPropagation();

  return {
    togglePicker,
    handlePositionChange,
    stopClickPropagation,
  };
}
