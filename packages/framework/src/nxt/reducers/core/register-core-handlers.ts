import type { HandlerDefDto } from '../../definitions/dto/handler-def.dto';
import type { ReducerImpl } from '../../runtime/registries/handlers/handler-impl-registry';
import type { CoreRegistries } from '../../runtime/registries/core-registries';
import type { UIState } from '../../../types/state';
import { ActionCatalog } from '../../runtime/actions/action-catalog';
import { logsAppendReducer, logsClearReducer } from './logs.reducer';
import { stateHydrateReducer } from './state-hydrate.reducer';

const coreHandlers = [
  { action: ActionCatalog.StateHydrate, implKey: 'reducer:state/hydrate@1', reducer: stateHydrateReducer },
  { action: ActionCatalog.LogsAppend, implKey: 'reducer:logs/append@1', reducer: logsAppendReducer },
  { action: ActionCatalog.LogsClear, implKey: 'reducer:logs/clear@1', reducer: logsClearReducer },
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
