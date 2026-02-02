import { DockPosition } from "./dock-manager.view";
import { PositionPicker } from "./dock-position-picker.view";


export const createPositionPickerHandlers = (picker: PositionPicker) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },
    getDotState: (position?: DockPosition) => {
        const isInvalid = !position;
        const isCurrent = picker.currentPos === position;
        const isOccupied = !!position && (picker.occupiedPositions || []).includes(position);

        const clickHandler = (event: Event) => {
            event.stopPropagation();
            if (isInvalid || isCurrent || isOccupied) return;
            picker.dispatchEvent(new CustomEvent('position-selected', {
                detail: { position },
                bubbles: true,
                composed: true,
            }));
        };

        return { isInvalid, isCurrent, isOccupied, clickHandler };
    },
});
