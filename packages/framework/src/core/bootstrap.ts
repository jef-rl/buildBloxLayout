import type { UIState, ViewDefinition, ViewTokenState } from '../types/index';
import { viewRegistry } from './registry/view-registry';
import { dispatchUiEvent } from '../utils/dispatcher';
import { getFrameworkLogger } from '../utils/logger';
import '../components/FrameworkRoot';

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

    const root = document.createElement('framework-root');
    const mountTarget = mount ?? document.body;
    mountTarget.appendChild(root);

    if (state) {
        dispatchUiEvent(root, 'state/hydrate', { state });
    }

    logger?.info?.('bootstrapFramework state hydrated.', summarizeState(state));

    logger?.info?.('bootstrapFramework root mounted.', {
        tagName: root.tagName.toLowerCase(),
        mountNode: mountTarget instanceof Element ? mountTarget.tagName.toLowerCase() : mountTarget.nodeName,
    });

    return root;
};
