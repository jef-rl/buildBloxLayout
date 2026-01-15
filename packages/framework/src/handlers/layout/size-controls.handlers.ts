import { dispatchUiEvent } from '../../utils/dispatcher';
import type { SizeControls } from '../../components/controls/Resizer';

export const createSizeControlsHandlers = (_controls: SizeControls) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },
    setViewport: (mode: string) => {
        dispatchUiEvent(window, 'layout/setViewportWidthMode', { mode });
    },
});
