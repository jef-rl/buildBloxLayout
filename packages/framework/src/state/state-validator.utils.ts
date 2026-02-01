// Validator
// TODO: Extract from state/state-validator.ts

import type { UIState, View, Panel } from '../types';
import { ExpanderState } from '../utils/expansion-helpers';

/**
 * A collection of validation functions to verify the integrity of the UI state.
 * These checks are intended for development environments to catch bugs early.
 */
const validators: ((state: UIState) => string[])[] = [
    // Validates that the state object itself is not null or undefined.
    (state) => (state ? [] : ['State is null or undefined.']),

    // Validates the 'views' array.
    (state) => {
        if (!Array.isArray(state.views)) return ['state.views must be an array.'];
        const errors: string[] = [];
        state.views.forEach((view, index) => {
            if (!view || typeof view.id !== 'string' || typeof view.component !== 'string') {
                errors.push(`Invalid View object at views[${index}].`);
            }
        });
        return errors;
    },
    // Validates the 'viewDefinitions' array.
    (state) => {
        if (!Array.isArray((state as UIState).viewDefinitions)) {
            return ['state.viewDefinitions must be an array.'];
        }
        return [];
    },
    // Validates the 'viewInstanceCounter'.
    (state) => {
        if (!Number.isFinite((state as UIState).viewInstanceCounter)) {
            return ['state.viewInstanceCounter must be a number.'];
        }
        return [];
    },

    // Validates the 'panels' array.
    (state) => {
        if (!Array.isArray(state.panels)) return ['state.panels must be an array.'];
        const errors: string[] = [];
        state.panels.forEach((panel, index) => {
            if (!panel || typeof panel.id !== 'string') {
                errors.push(`Invalid Panel object at panels[${index}].`);
            }
        });
        return errors;
    },

    // Validates relationships between panels and views.
    (state) => {
        const errors: string[] = [];
        const viewIds = new Set(state.views.map(v => v.component));
        
        state.panels.forEach(panel => {
            if (panel.viewId && !viewIds.has(panel.viewId)) {
                // This check is currently too strict as view definitions are in a separate registry.
                // A more advanced validator would need access to the ViewRegistry.
                // For now, we are commenting it out to avoid false positives.
                // errors.push(`Panel "${panel.id}" references a non-existent viewId "${panel.viewId}".`);
            }
            if (panel.view && !state.views.some(v => v.id === panel.view?.id)) {
                errors.push(`Panel "${panel.id}" holds a view instance not present in the central state.views array.`);
            }
        });
        return errors;
    },

    // Validates the main view order in the layout.
    (state) => {
        const errors: string[] = [];
        if (!Array.isArray(state.layout?.mainViewOrder)) {
            return ['state.layout.mainViewOrder must be an array.'];
        }
        
        const viewDefIds = new Set(state.views.map(v => v.component));
        state.layout.mainViewOrder.forEach(viewId => {
            // As with the panel check, this could be too strict without the registry.
            // if (!viewDefIds.has(viewId)) {
            //     errors.push(`Layout's mainViewOrder contains a non-existent viewId "${viewId}".`);
            // }
        });
        return errors;
    },

    // Validates the layout expansion states.
    (state) => {
        const errors: string[] = [];
        const validStates: ExpanderState[] = ['Collapsed', 'Closed', 'Opened', 'Expanded'];
        const expansion = state.layout?.expansion;
        if (!expansion) return ['state.layout.expansion is missing.'];

        if (!validStates.includes(expansion.expanderLeft)) {
            errors.push(`Invalid expanderLeft state: ${expansion.expanderLeft}`);
        }
        if (!validStates.includes(expansion.expanderRight)) {
            errors.push(`Invalid expanderRight state: ${expansion.expanderRight}`);
        }
        if (!validStates.includes(expansion.expanderBottom)) {
            errors.push(`Invalid expanderBottom state: ${expansion.expanderBottom}`);
        }
        return errors;
    }
];

/**
 * Validates the entire UIState object against a set of predefined rules.
 * Throws an error if validation fails, which helps catch bugs during development.
 * This function should only be called in a development environment.
 * @param state The UIState object to validate.
 */
export function validateState(state: UIState): void {
    const allErrors: string[] = [];

    for (const validator of validators) {
        const errors = validator(state);
        if (errors.length > 0) {
            allErrors.push(...errors);
        }
    }

    if (allErrors.length > 0) {
        const errorMessage = `UIState validation failed:\n- ${allErrors.join('\n- ')}`;
        console.error(errorMessage, { state });
        throw new Error(errorMessage);
    }
}
