import type { HandlerDefDto } from '../../definitions/dto/handler-def.dto';
import type { ReducerImpl } from '../../runtime/registries/handlers/handler-impl-registry';
import type { CoreRegistries } from '../../runtime/registries/core-registries';
import type { UIState } from '../../../types/state';
import { ActionCatalog } from '../../runtime/actions/action-catalog';
import { contextPatchReducer } from './context-patch.reducer';
import { contextUpdateReducer } from './context-update.reducer';
import { layoutUpdateReducer } from './layout-update.reducer';
import { logsAppendReducer } from './logs-append.reducer';
import { logsClearReducer } from './logs-clear.reducer';
import { logsSetMaxReducer } from './logs-set-max.reducer';
import { panelsUpdateReducer } from './panels-update.reducer';
import { stateHydrateReducer } from './state-hydrate.reducer';

const coreHandlers = [
  { action: ActionCatalog.StateHydrate, implKey: 'reducer:state/hydrate@1', reducer: stateHydrateReducer },
  { action: ActionCatalog.ContextUpdate, implKey: 'reducer:context/update@1', reducer: contextUpdateReducer },
  { action: ActionCatalog.ContextPatch, implKey: 'reducer:context/patch@1', reducer: contextPatchReducer },
  { action: ActionCatalog.LayoutUpdate, implKey: 'reducer:layout/update@1', reducer: layoutUpdateReducer },
  { action: ActionCatalog.PanelsUpdate, implKey: 'reducer:panels/update@1', reducer: panelsUpdateReducer },
  { action: ActionCatalog.LogsAppend, implKey: 'reducer:logs/append@1', reducer: logsAppendReducer },
  { action: ActionCatalog.LogsClear, implKey: 'reducer:logs/clear@1', reducer: logsClearReducer },
  { action: ActionCatalog.LogsSetMax, implKey: 'reducer:logs/setMax@1', reducer: logsSetMaxReducer },
];

const buildHandlerDefs = (): HandlerDefDto[] =>
  coreHandlers.map(({ action, implKey }) => ({
    id: `handler:${action}`,
    action,
    implKey,
  }));

export const registerCoreHandlers = <S extends UIState>(registries: CoreRegistries<S>): void => {
  for (const { implKey, reducer } of coreHandlers) {
    registries.handlerImpls.register(implKey, reducer as unknown as ReducerImpl<S, any>);
  }

  const defs = buildHandlerDefs();
  for (const def of defs) {
    registries.handlers.applyDefinition(def);
  }
};
