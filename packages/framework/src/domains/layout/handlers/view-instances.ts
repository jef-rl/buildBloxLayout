import { viewRegistry } from '../../../core/registry/view-registry';
import type { ReducerHandler } from '../../../core/registry/ReducerHandler.type';
import type { FrameworkContextState } from '../../workspace/handlers/registry';
import type { ViewInstance } from '../../panels/types';

export const createInstance: ReducerHandler<FrameworkContextState> = (context, action) => {
    const { definitionId, overrides } = action.payload as { definitionId: string, overrides?: Partial<ViewInstance> };
    const instance = viewRegistry.createInstance(definitionId, overrides);

    if (!instance) {
        return { state: context, followUps: [] };
    }

    const nextInstances = {
        ...(context.state.viewInstances || {}),
        [instance.instanceId]: instance
    };

    return {
        state: {
            ...context,
            state: {
                ...context.state,
                viewInstances: nextInstances
            }
        },
        followUps: []
    };
};

export const updateLocalContext: ReducerHandler<FrameworkContextState> = (context, action) => {
    const { instanceId, context: newContext } = action.payload as { instanceId: string, context: Record<string, any> };
    const currentInstance = context.state.viewInstances?.[instanceId];

    if (!currentInstance) {
        return { state: context, followUps: [] };
    }

    const nextInstance = {
        ...currentInstance,
        localContext: {
            ...currentInstance.localContext,
            ...newContext
        }
    };

    return {
        state: {
            ...context,
            state: {
                ...context.state,
                viewInstances: {
                    ...(context.state.viewInstances || {}),
                    [instanceId]: nextInstance
                }
            }
        },
        followUps: []
    };
};

export const destroyInstance: ReducerHandler<FrameworkContextState> = (context, action) => {
    const { instanceId } = action.payload as { instanceId: string };
    const { [instanceId]: _, ...remainingInstances } = context.state.viewInstances || {};

    return {
        state: {
            ...context,
            state: {
                ...context.state,
                viewInstances: remainingInstances
            }
        },
        followUps: []
    };
};

export const viewInstanceHandlers = {
    'view/createInstance': createInstance,
    'view/updateLocalContext': updateLocalContext,
    'view/destroyInstance': destroyInstance
};
