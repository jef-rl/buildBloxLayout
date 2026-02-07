import type { UIState, ViewDefinition, FrameworkAuthConfig } from '../types/index';
import { viewRegistry } from '../../nxt/runtime/registries/views/view-registry-legacy-api';
import { dispatchUiEvent } from '../legacy/dispatcher';
import { ActionCatalog } from '../../nxt/runtime/actions/action-catalog';
import { logInfo } from '../../nxt/runtime/engine/logging/framework-logger';
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
    views.forEach((view) => {
        viewRegistry.register(view);
    });

    logInfo('bootstrapFramework views registered.', {
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
        logInfo('bootstrapFramework auth configured.', {
            enabled: auth.enabled,
            authViewId: auth.authViewId ?? 'firebase-auth',
            autoShowOnStartup: auth.autoShowOnStartup ?? false,
        });
    }

    mountTarget.appendChild(root);

    const mergedState = state
        ? { ...state, viewDefinitions: state.viewDefinitions ?? viewDefinitions }
        : { viewDefinitions };
    dispatchUiEvent(root, ActionCatalog.StateHydrate, { state: mergedState });

    logInfo('bootstrapFramework state hydrated.', summarizeState(mergedState));

    logInfo('bootstrapFramework root mounted.', {
        tagName: root.tagName.toLowerCase(),
        mountNode: mountTarget instanceof Element ? mountTarget.tagName.toLowerCase() : mountTarget.nodeName,
    });

    return root;
};
