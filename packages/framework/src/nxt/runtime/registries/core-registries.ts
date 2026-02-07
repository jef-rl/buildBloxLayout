import { ActionRegistry } from './actions/action-registry';
import { HandlerImplRegistry } from './handlers/handler-impl-registry';
import { HandlerRegistry } from './handlers/handler-registry';
import { EffectImplRegistry } from './effects/effect-impl-registry';
import { EffectRegistry } from './effects/effect-registry';
import { ViewDefinitionRegistry } from './views/view-definition-registry';
import { ViewImplRegistry } from './views/view-impl-registry';
import { SelectorImplRegistry } from './selectors/selector-impl-registry';
import { applyFrameworkEffectDefs, registerFrameworkEffectImpls } from '../../effects/register-framework-effects';
import { registerFrameworkSelectorImpls } from '../../selectors/register-framework-selectors';
import { registerCoreHandlers } from '../../reducers/core/register-core-handlers';

export class CoreRegistries<S = any> {
  readonly actions = new ActionRegistry();
  readonly handlerImpls = new HandlerImplRegistry<S>();
  readonly handlers = new HandlerRegistry<S>(this.handlerImpls);
  readonly effectImpls = new EffectImplRegistry();
  readonly effects = new EffectRegistry(this.effectImpls);
  readonly viewDefs = new ViewDefinitionRegistry();
  readonly viewImpls = new ViewImplRegistry();
  readonly selectorImpls = new SelectorImplRegistry<S>();

  constructor() {
    registerCoreHandlers(this);
    registerFrameworkEffectImpls(this.effectImpls);
    registerFrameworkSelectorImpls(this.selectorImpls);
    applyFrameworkEffectDefs(this.effects);
  }
}
  
