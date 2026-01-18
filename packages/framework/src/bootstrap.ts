import type { UIState, ViewDefinition, ViewTokenState } from './types/index';
import { viewRegistry } from './registry/ViewRegistry';
import { uiState } from './state/ui-state';
import { getFrameworkLogger } from './utils/logger';
import './components/layout/FrameworkRoot';

export type BootstrapFrameworkOptions = {
    views: ViewDefinition[];
    state?: Partial<UIState>;
    mount?: ParentNode;
};

const summarizeState = (state?: Partial<UIState>) => {
    if (!state || typeof state !== 'object') {
        return { valueType: typeof state };
    }

    return {
        keys: Object.keys(state),
    };
};

export const bootstrapFramework = ({ views, state, mount }: BootstrapFrameworkOptions) => {
    const logger = getFrameworkLogger();

    views.forEach((view) => {
        viewRegistry.register(view);
    });

    logger?.info?.('bootstrapFramework views registered.', {
        count: views.length,
        viewIds: views.map((view) => view.id),
    });

    if (state) {
        uiState.hydrate(state);
    }

    logger?.info?.('bootstrapFramework state hydrated.', summarizeState(state));

    const root = document.createElement('framework-root');
    const mountTarget = mount ?? document.body;
    mountTarget.appendChild(root);

    logger?.info?.('bootstrapFramework root mounted.', {
        tagName: root.tagName.toLowerCase(),
        mountNode: mountTarget instanceof Element ? mountTarget.tagName.toLowerCase() : mountTarget.nodeName,
    });

    return root;
};