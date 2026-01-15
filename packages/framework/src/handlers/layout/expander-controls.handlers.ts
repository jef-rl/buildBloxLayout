import { dispatchUiEvent } from '../../utils/dispatcher';
import type { ExpanderControls } from '../../components/controls/Expander';

export const createExpanderControlsHandlers = (_controls: ExpanderControls) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },
    setExpansion: (side: 'left' | 'right' | 'bottom', expanded: boolean) => {
        dispatchUiEvent(window, 'layout/setExpansion', { side, expanded });
    },
    setOverlayView: (viewId: string | null) => {
        dispatchUiEvent(window, 'layout/setOverlayView', { viewId });
    },
});
