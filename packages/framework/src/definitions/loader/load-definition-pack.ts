import type { DefinitionPackDto } from '../dto/definition-pack.dto';
import type { CoreRegistries } from '../../runtime/registries/core-registries';
import type { UIState } from '../../types/state';
import { applyActionDefs } from './apply-action-defs';
import { applyHandlerDefs } from './apply-handler-defs';
import { applyEffectDefs } from './apply-effect-defs';
import { applyViewDefs } from './apply-view-defs';
import { applySelectorDefs } from './apply-selector-defs';

export function loadDefinitionPack<S extends UIState>(
  pack: DefinitionPackDto,
  registries: CoreRegistries<S>,
): void {
  if (pack.actions) applyActionDefs(registries.actions, pack.actions);
  if (pack.handlers) applyHandlerDefs(registries.handlers, pack.handlers);
  if (pack.effects) applyEffectDefs(registries.effects, pack.effects);
  if (pack.views) applyViewDefs(registries.viewDefs, pack.views);
  if (pack.selectors) applySelectorDefs(registries.selectorImpls, pack.selectors);
}
