import type { SelectorImplRegistry } from '../runtime/registries/selectors/selector-impl-registry';
import {
  overlayViewSelectorImpl,
  overlayViewSelectorKey,
} from './overlay/overlay-view.selector';
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
  registry.register(viewInstanceResolverSelectorKey, viewInstanceResolverSelectorImpl as any);
  registry.register(overlayViewSelectorKey, overlayViewSelectorImpl as any);
  registry.register(workspaceLayoutSelectorKey, workspaceLayoutSelectorImpl as any);
};
