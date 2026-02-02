
import '../components/FrameworkRoot';
import { dispatchUiEvent } from './helpers/dispatcher.utils';import { getFrameworkLogger } from './helpers/logger.utils';
import { ViewDefinition } from './types/panels.types';
import { FrameworkAuthConfig } from './types/state.types';
import { UIState } from './context/ui.state';
import { viewRegistry } from './registries/view.registry';

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
    const viewDefinitions = views.map((view) => ({
        id: view.id,
        name: view.name,
        title: view.title,
        icon: view.icon,
    }));

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

    const mergedState = state
        ? { ...state, viewDefinitions: state.viewDefinitions ?? viewDefinitions }
        : { viewDefinitions };
    dispatchUiEvent(root, 'state/hydrate', { state: mergedState });

    logger?.info?.('bootstrapFramework state hydrated.', summarizeState(mergedState));

    logger?.info?.('bootstrapFramework root mounted.', {
        tagName: root.tagName.toLowerCase(),
        mountNode: mountTarget instanceof Element ? mountTarget.tagName.toLowerCase() : mountTarget.nodeName,
    });

    return root;
};
