import type { SizeControls } from '../../components/controls/Resizer';
import type { UiStateContextValue } from '../../state/ui-state';

type UiDispatch = UiStateContextValue['dispatch'];

export const createSizeControlsHandlers = (
    _controls: SizeControls,
    getDispatch: () => UiDispatch | null,
) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },
    setViewport: (mode: string) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'layout/setViewportWidthMode', mode });
    },
});
