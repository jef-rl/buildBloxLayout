import { ViewportWidthMode } from "../types/core.types";
import { ExpanderState, toggleExpanderState } from "../helpers/expansion-helpers.utils";
import { MainAreaPanelCount, LayoutExpansion, LayoutState } from "../types/state.types";

const VIEWPORT_WIDTH_MODES: ViewportWidthMode[] = ['1x', '2x', '3x', '4x', '5x'];

const isViewportWidthMode = (mode: unknown): mode is ViewportWidthMode =>
    typeof mode === 'string' && VIEWPORT_WIDTH_MODES.includes(mode as ViewportWidthMode);

const normalizeViewportWidthMode = (mode: unknown): ViewportWidthMode =>
    isViewportWidthMode(mode) ? mode : '1x';

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
    // Extract numeric value from mode (e.g., '4x' → 4)
    const modeValue = Number.parseInt(mode, 10);

    // If mode is invalid or NaN, return '1x'
    if (Number.isNaN(modeValue) || modeValue < 1) {
        return '1x';
    }

    // Clamp to capacity
    const clampedValue = Math.min(modeValue, capacity);

    // Return clamped mode (e.g., 3 → '3x')
    return `${clampedValue}x` as ViewportWidthMode;
};

const resolveExpansion = (
	current: LayoutExpansion,
	side: 'left' | 'right' | 'bottom',
	state: ExpanderState,
): LayoutExpansion => {
	const key = `expander${side.charAt(0).toUpperCase()}${side.slice(1)}` as keyof LayoutExpansion;
	return {
		...current,
		[key]: state,
	};
};

export const applyLayoutAction = (
    layout: LayoutState,
    payload: { type: string; [key: string]: unknown },
): LayoutState | null => {
    switch (payload.type) {
        case 'layout/setExpansion': {
            const side = payload.side as 'left' | 'right' | 'bottom';
            const key = `expander${side.charAt(0).toUpperCase()}${side.slice(1)}` as keyof LayoutExpansion;

            if (!side || !(key in layout.expansion)) {
                return null;
            }

            // Determine new state
            let newState: ExpanderState;
            if (typeof payload.expanded === 'boolean') {
                // Legacy boolean support for backward compatibility
                newState = payload.expanded ? 'Opened' : 'Closed';
            } else if (typeof payload.state === 'string') {
                // Direct state assignment
                newState = payload.state as ExpanderState;
            } else {
                // Toggle behavior
                newState = toggleExpanderState(layout.expansion[key]);
            }

            return {
                ...layout,
                expansion: resolveExpansion(layout.expansion, side, newState),
            };
        }
        case 'layout/setOverlayView': {
            return {
                ...layout,
                overlayView: (payload.viewId as string | null | undefined) ?? null,
            };
        }
        case 'layout/setOverlayExpander': {
            return {
                ...layout,
                overlayExpander: (payload.viewId as string | null | undefined) ?? null,
            };
        }
        case 'layout/unsetOverlayExpander': {
            return {
                ...layout,
                overlayExpander: null,
            };
        }
        case 'layout/resetExpanders': {
            return {
                ...layout,
                expansion: {
                    expanderLeft: 'Closed',
                    expanderRight: 'Closed',
                    expanderBottom: 'Closed',
                },
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
