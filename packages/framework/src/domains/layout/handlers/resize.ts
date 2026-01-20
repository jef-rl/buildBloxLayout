import type { Panel, PanelContainer } from '../../../types/index';
import { dispatchUiEvent } from '../../../utils/dispatcher';

const MIN_PANEL_SIZE = 50;

export const resizeHandlers = {
    RESIZE_PANEL: (payload: { container: PanelContainer, panel: Panel, deltaX: number, deltaY: number }) => {
        const { container, panel, deltaX, deltaY } = payload;
        const isHorizontal = container.direction === 'row';

        const mainAxis = isHorizontal ? 'width' : 'height';
        const crossAxis = isHorizontal ? 'height' : 'width';

        const delta = isHorizontal ? deltaX : deltaY;

        if (!panel.element || !container.element) return;

        const panelRect = panel.element.getBoundingClientRect();
        const containerRect = container.element.getBoundingClientRect();

        const panelSize = panelRect[mainAxis];
        const containerSize = containerRect[mainAxis];

        const newSize = panelSize + delta;
        const newFlexGrow = newSize / containerSize;

        if (newSize < MIN_PANEL_SIZE) return;

        panel.element.style.flexGrow = newFlexGrow.toString();

        dispatchUiEvent(window, 'panel-resized', { panelId: panel.id });
    },
};
