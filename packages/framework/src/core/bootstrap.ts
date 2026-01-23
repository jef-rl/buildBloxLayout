import type { UIState, ViewDefinition, FrameworkAuthConfig } from '../types/index';
import { viewRegistry } from './registry/view-registry';
import { dispatchUiEvent } from '../utils/dispatcher';
import { getFrameworkLogger } from '../utils/logger';
import '../components/FrameworkRoot';

export type BootstrapFrameworkOptions = {
    views: ViewDefinition[];
    state?: Partial<UIState>;
    mount?: ParentNode;
    auth?: FrameworkAuthConfig;
};

const summarizeState = (state?: Partial<UIState>) => {
    if (!state || typeof state !== 'object') {
        return { valueType: typeof state };
    }

    return {
        keys: Object.keys(state),
    };
};

export const bootstrapFramework = ({ views, state, mount, auth }: BootstrapFrameworkOptions) => {
    const logger = getFrameworkLogger();

    views.forEach((view) => {
        viewRegistry.register(view);
    });

    logger?.info?.('bootstrapFramework views registered.', {
        count: views.length,
        viewIds: views.map((view) => view.id),
    });

    const root = document.createElement('framework-root') as any;
    const mountTarget = mount ?? document.body;

    // Configure auth BEFORE mounting so connectedCallback can access it
    if (auth) {
        root.authConfig = auth;
        logger?.info?.('bootstrapFramework auth configured.', {
            enabled: auth.enabled,
            authViewId: auth.authViewId ?? 'firebase-auth',
            autoShowOnStartup: auth.autoShowOnStartup ?? false,
        });
    }

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
