import type { SelectorImplRegistry } from '../runtime/registries/selectors/selector-impl-registry';
import { authStateSelectorImpl, authStateSelectorKey } from './auth/auth-state.selector';
import { authUiSelectorImpl, authUiSelectorKey } from './auth/auth-ui.selector';
import { activePresetSelectorImpl, activePresetSelectorKey } from './layout/active-preset.selector';
import { canDragViewsSelectorImpl, canDragViewsSelectorKey } from './layout/can-drag-views.selector';
import { menuItemsSelectorImpl, menuItemsSelectorKey } from './layout/menu-items.selector';
import { layoutPresetsSelectorImpl, layoutPresetsSelectorKey } from './layout/presets.selector';
import { logsViewSelectorImpl, logsViewSelectorKey } from './logs/logs-view.selector';
import {
  overlayViewSelectorImpl,
  overlayViewSelectorKey,
} from './overlay/overlay-view.selector';
import { viewDefinitionsSelectorImpl, viewDefinitionsSelectorKey } from './views/view-definitions.selector';
import {
  viewInstanceResolverSelectorImpl,
  viewInstanceResolverSelectorKey,
} from './view-instances/resolve-view-instance.selector';
import {
  workspaceLayoutSelectorImpl,
  workspaceLayoutSelectorKey,
} from './workspace/workspace-layout.selector';

export const registerFrameworkSelectorImpls = <S>(
  registry: SelectorImplRegistry<S>,
): void => {
  registry.register(activePresetSelectorKey, activePresetSelectorImpl as any);
  registry.register(authStateSelectorKey, authStateSelectorImpl as any);
  registry.register(authUiSelectorKey, authUiSelectorImpl as any);
  registry.register(canDragViewsSelectorKey, canDragViewsSelectorImpl as any);
  registry.register(layoutPresetsSelectorKey, layoutPresetsSelectorImpl as any);
  registry.register(logsViewSelectorKey, logsViewSelectorImpl as any);
  registry.register(menuItemsSelectorKey, menuItemsSelectorImpl as any);
  registry.register(viewInstanceResolverSelectorKey, viewInstanceResolverSelectorImpl as any);
  registry.register(viewDefinitionsSelectorKey, viewDefinitionsSelectorImpl as any);
  registry.register(overlayViewSelectorKey, overlayViewSelectorImpl as any);
  registry.register(workspaceLayoutSelectorKey, workspaceLayoutSelectorImpl as any);
};
