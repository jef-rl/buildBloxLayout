import type { LayoutExpansion, LayoutState, MainAreaPanelCount, ViewportWidthMode } from '../../state/ui-state';

const VIEWPORT_WIDTH_MODES: ViewportWidthMode[] = ['auto', '1x', '2x', '3x', '4x', '5x'];

const isViewportWidthMode = (mode: unknown): mode is ViewportWidthMode =>
    typeof mode === 'string' && VIEWPORT_WIDTH_MODES.includes(mode as ViewportWidthMode);

const normalizeViewportWidthMode = (mode: unknown): ViewportWidthMode =>
    isViewportWidthMode(mode) ? mode : 'auto';

const normalizeMainAreaCount = (
    value: unknown,
    fallback: MainAreaPanelCount = 1,
): MainAreaPanelCount => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        return fallback;
    }

    const clamped = Math.min(5, Math.max(1, Math.round(parsed)));
    return clamped as MainAreaPanelCount;
};

const resolveExpansion = (
    current: LayoutExpansion,
    side: keyof LayoutExpansion,
    expanded: boolean,
): LayoutExpansion => {
    if (!expanded) {
        return {
            ...current,
            [side]: false,
        };
    }

    return {
        left: false,
        right: false,
        bottom: false,
        [side]: true,
    };
};

export const applyLayoutAction = (
    state: { layout: LayoutState },
    payload: { type: string; [key: string]: unknown },
): boolean => {
    switch (payload.type) {
        case 'layout/setExpansion': {
            const side = payload.side as keyof LayoutExpansion;
            if (!side || !(side in state.layout.expansion)) {
                return false;
            }

            state.layout.expansion = resolveExpansion(
                state.layout.expansion,
                side,
                Boolean(payload.expanded),
            );
            return true;
        }
        case 'layout/setOverlayView': {
            state.layout.overlayView = (payload.viewId as string | null | undefined) ?? null;
            return true;
        }
        case 'layout/setViewportWidthMode': {
            state.layout.viewportWidthMode = normalizeViewportWidthMode(payload.mode);
            return true;
        }
        case 'layout/setMainAreaCount': {
            state.layout.mainAreaCount = normalizeMainAreaCount(
                payload.count ?? payload.mainAreaCount,
                state.layout.mainAreaCount ?? 1,
            );
            return true;
        }
        default:
            return false;
    }
};
