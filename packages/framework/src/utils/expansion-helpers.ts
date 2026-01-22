import type { LayoutExpansion } from '../types/state.js';

export type ExpanderState = 'Collapsed' | 'Closed' | 'Opened' | 'Expanded';

export type LegacyLayoutExpansion = {
	left: boolean;
	right: boolean;
	bottom: boolean;
};

/**
 * Check if the expander button should be visible for the given state.
 * Buttons are visible for Closed and Opened states only.
 * Collapsed and Expanded states hide the button.
 *
 * @param state - The current expander state
 * @returns true if button should be visible
 */
export function isExpanderButtonVisible(state: ExpanderState): boolean {
	return state === 'Closed' || state === 'Opened';
}

/**
 * Check if the panel should be open for the given state.
 * Panels are open for Opened and Expanded states.
 * Panels are closed for Closed and Collapsed states.
 *
 * @param state - The current expander state
 * @returns true if panel should be open
 */
export function isExpanderPanelOpen(state: ExpanderState): boolean {
	return state === 'Opened' || state === 'Expanded';
}

/**
 * Toggle between user-accessible expander states.
 * Toggles between Closed and Opened states.
 * Collapsed state transitions to Opened.
 * Expanded state transitions to Closed.
 *
 * @param current - The current expander state
 * @returns The new expander state after toggle
 */
export function toggleExpanderState(current: ExpanderState): ExpanderState {
	return current === 'Closed' || current === 'Collapsed' ? 'Opened' : 'Closed';
}

/**
 * Migrate legacy boolean expansion format to new string-based format.
 * false maps to 'Closed'
 * true maps to 'Opened'
 *
 * @param legacy - The legacy expansion object with boolean properties
 * @returns The new expansion object with string properties
 */
export function migrateLegacyExpansion(legacy: LegacyLayoutExpansion): LayoutExpansion {
	return {
		expanderLeft: legacy.left ? 'Opened' : 'Closed',
		expanderRight: legacy.right ? 'Opened' : 'Closed',
		expanderBottom: legacy.bottom ? 'Opened' : 'Closed',
	};
}
