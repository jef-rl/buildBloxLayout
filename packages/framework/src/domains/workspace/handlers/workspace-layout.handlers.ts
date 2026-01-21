import type { LayoutExpansion, LayoutState, MainAreaPanelCount } from '../../../types/state';
import type { ViewportWidthMode } from '../../../types/core';

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

export const clampViewportModeToCapacity = (
    mode: ViewportWidthMode,
    capacity: MainAreaPanelCount,
): ViewportWidthMode => {
    // Preserve 'auto' mode
    if (mode === 'auto') {
        return 'auto';
    }

    // Extract numeric value from mode (e.g., '4x' → 4)
    const modeValue = Number.parseInt(mode, 10);

    // If mode is invalid or NaN, return 'auto'
    if (Number.isNaN(modeValue) || modeValue < 1) {
        return 'auto';
    }

    // Clamp to capacity
    const clampedValue = Math.min(modeValue, capacity);

    // Return clamped mode (e.g., 3 → '3x')
    return `${clampedValue}x` as ViewportWidthMode;
};

const resolveExpansion = (
    current: LayoutExpansion,
    side: keyof LayoutExpansion,
    expanded: boolean,
): LayoutExpansion => {
    return {
        ...current,
        [side]: expanded,
    };
};

export const applyLayoutAction = (
    layout: LayoutState,
    payload: { type: string; [key: string]: unknown },
): LayoutState | null => {
    switch (payload.type) {
        case 'layout/setExpansion': {
            const side = payload.side as keyof LayoutExpansion;
            if (!side || !(side in layout.expansion)) {
                return null;
            }

            return {
                ...layout,
                expansion: resolveExpansion(
                    layout.expansion,
                    side,
                    Boolean(payload.expanded),
                ),
            };
        }
        case 'layout/setOverlayView': {
            return {
                ...layout,
                overlayView: (payload.viewId as string | null | undefined) ?? null,
            };
        }
        case 'layout/setViewportWidthMode': {
            const mode = normalizeViewportWidthMode(payload.mode);
            return {
                ...layout,
                viewportWidthMode: mode,
            };
        }
        case 'layout/setMainAreaCount': {
            return {
                ...layout,
                mainAreaCount: normalizeMainAreaCount(
                    payload.count ?? payload.mainAreaCount,
                    layout.mainAreaCount ?? 1,
                ),
            };
        }
        default:
            return null;
    }
};
