import type { ReducerHandler } from '../../../core/registry/ReducerHandler.type';
import type { FrameworkContextState } from '../../workspace/handlers/registry';
import { ActionCatalog } from '../../../../nxt/runtime/actions/action-catalog';

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

export const viewInstanceHandlers = {
    [ActionCatalog.ViewUpdateLocalContext]: updateLocalContext,
};
