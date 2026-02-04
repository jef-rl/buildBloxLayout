import { dispatchUiEvent } from '../../../legacy/dispatcher';

const getFloatingCords = (id: string) => {
    // This is a placeholder. In a real application, you would get the coordinates
    // of the floating element from the DOM.
    return { x: 100, y: 100 };
};

export const positionHandlers = {
    REQUEST_FLOATING_CORDS: (payload: { id: string }) => {
        const cords = getFloatingCords(payload.id);
        if (cords) {
            dispatchUiEvent(window, 'floating-cords-update', cords);
        }
    },
};
