import { DockContainer } from "./dock-container.view";
import { DockPosition } from "./dock-manager.view";

export const createDockContainerHandlers = (container: DockContainer) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },
    togglePicker: (event?: Event) => {
        event?.stopPropagation();
        container.manager?.togglePicker(container.toolbarId);
    },
    handlePositionChange: (event: CustomEvent<{ position: DockPosition }>) => {
        event.stopPropagation();
        const position = event.detail?.position;
        if (!position) return;
        container.manager?.setPosition(container.toolbarId, position);
    },
});
