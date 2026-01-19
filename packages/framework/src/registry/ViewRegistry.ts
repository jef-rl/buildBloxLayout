import { LitElement } from 'lit';
import type { View, ViewDefinition } from '../types/index';
import { getFrameworkLogger } from '../utils/logger';

export type ViewRegistryChangeDetail = {
    type: 'register';
    viewId: string;
    definition: ViewDefinition;
    total: number;
};

class ViewRegistry extends EventTarget {
    private readonly viewDefinitions: Map<string, ViewDefinition> = new Map();
    private readonly componentCache: Map<string, any> = new Map();

    register(definition: ViewDefinition): void {
        const logger = getFrameworkLogger();
        const wasRegistered = this.viewDefinitions.has(definition.id);

        if (!definition.icon || definition.icon.trim() === '') {
            logger?.warn?.('ViewRegistry register failed. Missing icon for view.', {
                viewId: definition.id,
                title: definition.title,
                tag: definition.tag,
            });
            return;
        }

        this.viewDefinitions.set(definition.id, definition);
        logger?.info?.('ViewRegistry registered view.', {
            viewId: definition.id,
            title: definition.title,
            tag: definition.tag,
            icon: definition.icon,
            existed: wasRegistered,
        });
        this.emitRegistryChange({
            type: 'register',
            viewId: definition.id,
            definition,
            total: this.viewDefinitions.size,
        });
    }

    get(id: string): ViewDefinition | undefined {
        return this.viewDefinitions.get(id);
    }

    async getComponent(id: string): Promise<any | undefined> {
        if (this.componentCache.has(id)) {
            return this.componentCache.get(id);
        }

        const definition = this.get(id);
        if (!definition) {
            return undefined;
        }

        try {
            const component = await definition.component();
            this.componentCache.set(id, component);
            return component;
        } catch (error) {
            console.error(`Error loading component for view '${id}':`, error);
            return undefined;
        }
    }

    createView(viewId: string, data?: unknown): View | undefined {
        const definition = this.get(viewId);
        if (!definition) {
            console.warn(`View definition not found for '${viewId}'`);
            return undefined;
        }

        return {
            id: `${viewId}-${Date.now()}`,
            name: definition.title,
            component: viewId, // Store the component ID, not the loaded component
            data: data || {},
            element: document.createElement(definition.tag) as LitElement,
        };
    }

    getAllViews(): ViewDefinition[] {
        return Array.from(this.viewDefinitions.values());
    }

    onRegistryChange(listener: (event: CustomEvent<ViewRegistryChangeDetail>) => void): () => void {
        const handler = listener as EventListener;
        this.addEventListener('registry-change', handler);
        return () => {
            this.removeEventListener('registry-change', handler);
        };
    }

    private emitRegistryChange(detail: ViewRegistryChangeDetail) {
        const logger = getFrameworkLogger();
        this.dispatchEvent(new CustomEvent<ViewRegistryChangeDetail>('registry-change', { detail }));
        logger?.info?.('ViewRegistry registry change.', detail);
    }
}

export interface ViewRegistryApi {
    register(definition: ViewDefinition): void;
    get(id: string): ViewDefinition | undefined;
    getComponent(id: string): Promise<any | undefined>;
    createView(viewId: string, data?: unknown): View | undefined;
    getAllViews(): ViewDefinition[];
    onRegistryChange(listener: (event: CustomEvent<ViewRegistryChangeDetail>) => void): () => void;
}

export const viewRegistry = new ViewRegistry();
