const dispatchPositionEvent = (type: string, payload?: unknown) => {
    const root = window.document?.querySelector('framework-root') ?? window;
    root.dispatchEvent(new CustomEvent('ui-event', {
        detail: { type, payload },
        bubbles: true,
        composed: true,
    }));
};

const getFloatingCords = (id: string) => {
    // This is a placeholder. In a real application, you would get the coordinates
    // of the floating element from the DOM.
    return { x: 100, y: 100 };
};

export const positionHandlers = {
    REQUEST_FLOATING_CORDS: (payload: { id: string }) => {
        const cords = getFloatingCords(payload.id);
        if (cords) {
            dispatchPositionEvent('floating-cords-update', cords);
        }
    },
};
