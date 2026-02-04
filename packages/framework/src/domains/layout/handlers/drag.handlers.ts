import { HandlerAction } from '../../../core/registry/HandlerAction.type';
import { ReducerHandler } from '../../../core/registry/ReducerHandler.type';
import { UIState } from '../../../state/ui-state';
import { cloneDeep } from 'lodash-es';
import { ActionCatalog } from '../../../nxt/runtime/actions/action-catalog';

const dragStart: ReducerHandler<UIState> = (state, action) => {
    const payload = action.payload as { viewId: string } | undefined;
    const viewId = payload?.viewId;

    if (!viewId) {
        return { state, followUps: [] };
    }

    const nextState = cloneDeep(state);
    if (!nextState.layout) {
        nextState.layout = {} as any;
    }
    nextState.layout.draggedViewId = viewId;
    return { state: nextState, followUps: [] };
};

const dragEnd: ReducerHandler<UIState> = (state) => {
    const nextState = cloneDeep(state);
    if (nextState.layout) {
        nextState.layout.draggedViewId = null;
    }
    return { state: nextState, followUps: [] };
};

export const dragHandlers = {
    [ActionCatalog.LayoutDragStart]: dragStart,
    [ActionCatalog.LayoutDragEnd]: dragEnd,
};
