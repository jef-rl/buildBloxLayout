import type { DockPosition } from '../../components/layout/DockManager';
import type { PositionPicker } from '../../components/layout/PositionPicker';

export const createPositionPickerHandlers = (picker: PositionPicker) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },
    getDotState: (position: DockPosition) => {
        const isCurrent = picker.currentPos === position;
        const isOccupied = (picker.occupiedPositions || []).includes(position);

        const clickHandler = (event: Event) => {
            event.stopPropagation();
            if (isCurrent || isOccupied) return;
            picker.dispatchEvent(new CustomEvent('position-selected', {
                detail: { position },
                bubbles: true,
                composed: true,
            }));
        };

        return { isCurrent, isOccupied, clickHandler };
    },
});
