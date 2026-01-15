import { LitElement } from 'lit';
import { uiState, type UiState } from '../state/ui-state';
import type { View, ViewComponent, ViewDefinition } from '../types/index';

class ViewRegistry {
    private readonly viewDefinitions: Map<string, ViewDefinition> = new Map();
    private readonly componentCache: Map<string, any> = new Map();

    register(definition: ViewDefinition): void {
        this.viewDefinitions.set(definition.id, definition);
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
}

export interface ViewRegistryApi {
    register(definition: ViewDefinition): void;
    get(id: string): ViewDefinition | undefined;
    getComponent(id: string): Promise<any | undefined>;
    createView(viewId: string, data?: unknown): View | undefined;
    getAllViews(): ViewDefinition[];
}

export const viewRegistry = new ViewRegistry();
