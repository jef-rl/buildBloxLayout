import type { View, ViewDefinition, ViewInstance } from '../../../types/index';
import type { ViewDefDto } from '../../../definitions/dto/view-def.dto';
import { CoreRegistries } from '../core-registries';
import { logError, logInfo, logWarn } from '../../engine/logging/framework-logger';

export type ViewRegistryChangeDetail = {
    type: 'register';
    viewId: string;
    definition: ViewDefinition;
    total: number;
};

const buildLegacyDefinition = (
    def: ViewDefDto,
    component: () => Promise<unknown>,
): ViewDefinition => {
    const name = def.name ?? def.title ?? def.id;
    const title = def.title ?? def.name ?? def.id;

    return {
        id: def.id,
        name,
        title,
        tag: def.tagName,
        icon: def.icon ?? '',
        component,
        defaultContext: def.defaultContext,
    };
};

class ViewRegistryLegacyApiImpl extends EventTarget {
    private readonly registries = new CoreRegistries();
    private readonly componentCache = new Map<string, unknown>();

    register(definition: ViewDefinition): void {
        const wasRegistered = Boolean(this.registries.viewDefs.get(definition.id));

        if (!definition.icon || definition.icon.trim() === '') {
            logWarn('ViewRegistry register failed. Missing icon for view.', {
                viewId: definition.id,
                title: definition.title,
                tag: definition.tag,
            });
            return;
        }

        const implKey = definition.id;
        this.registries.viewDefs.register({
            id: definition.id,
            tagName: definition.tag,
            implKey,
            name: definition.name,
            title: definition.title,
            icon: definition.icon,
            defaultContext: definition.defaultContext,
        });
        this.registries.viewImpls.register(implKey, {
            tagName: definition.tag,
            preload: definition.component,
        });

        logInfo('ViewRegistry registered view.', {
            viewId: definition.id,
            title: definition.title,
            tag: definition.tag,
            icon: definition.icon,
            existed: wasRegistered,
        });
        this.emitRegistryChange({
            type: 'register',
            viewId: definition.id,
            definition: this.get(definition.id) ?? definition,
            total: this.registries.viewDefs.entries().length,
        });
    }

    get(id: string): ViewDefinition | undefined {
        const def = this.registries.viewDefs.get(id);
        if (!def) {
            return undefined;
        }
        const implKey = def.implKey ?? def.id;
        const impl = this.registries.viewImpls.get(implKey);
        const component = async () => {
            if (!impl?.preload) {
                return undefined;
            }
            return impl.preload();
        };
        return buildLegacyDefinition(def, component);
    }

    async getComponent(id: string): Promise<unknown | undefined> {
        if (this.componentCache.has(id)) {
            return this.componentCache.get(id);
        }

        const def = this.registries.viewDefs.get(id);
        if (!def) {
            return undefined;
        }

        const implKey = def.implKey ?? def.id;
        const impl = this.registries.viewImpls.get(implKey);
        if (!impl?.preload) {
            return undefined;
        }

        try {
            const component = await impl.preload();
            this.componentCache.set(id, component);
            return component;
        } catch (error) {
            logError(error, { message: `Error loading component for view '${id}'.`, viewId: id });
            return undefined;
        }
    }

    createView(viewId: string, data?: unknown, instanceId?: string): View | undefined {
        const definition = this.get(viewId);
        if (!definition) {
            logWarn(`View definition not found for '${viewId}'`, { viewId });
            return undefined;
        }

        return {
            id: instanceId ?? `${viewId}-${Date.now()}`,
            name: definition.title,
            component: viewId,
            data: data || {},
        };
    }

    createInstance(definitionId: string, overrides?: Partial<ViewInstance>): ViewInstance | undefined {
        const def = this.registries.viewDefs.get(definitionId);
        if (!def) {
            logWarn(`View definition not found for '${definitionId}'`, { definitionId });
            return undefined;
        }

        const instanceId =
            overrides?.instanceId ?? `${definitionId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        return {
            instanceId,
            definitionId,
            title: overrides?.title ?? def.title,
            localContext: {
                ...(def.defaultContext || {}),
                ...(overrides?.localContext || {}),
            },
        };
    }

    getAllViews(): ViewDefinition[] {
        return this.registries.viewDefs.entries().map((def) => {
            const implKey = def.implKey ?? def.id;
            const impl = this.registries.viewImpls.get(implKey);
            const component = async () => {
                if (!impl?.preload) {
                    return undefined;
                }
                return impl.preload();
            };
            return buildLegacyDefinition(def, component);
        });
    }

    onRegistryChange(listener: (event: CustomEvent<ViewRegistryChangeDetail>) => void): () => void {
        const handler = listener as EventListener;
        this.addEventListener('registry-change', handler);
        return () => {
            this.removeEventListener('registry-change', handler);
        };
    }

    private emitRegistryChange(detail: ViewRegistryChangeDetail) {
        this.dispatchEvent(new CustomEvent<ViewRegistryChangeDetail>('registry-change', { detail }));
        logInfo('ViewRegistry registry change.', detail);
    }
}

export interface ViewRegistryApi {
    register(definition: ViewDefinition): void;
    get(id: string): ViewDefinition | undefined;
    getComponent(id: string): Promise<unknown | undefined>;
    createView(viewId: string, data?: unknown, instanceId?: string): View | undefined;
    createInstance(definitionId: string, overrides?: Partial<ViewInstance>): ViewInstance | undefined;
    getAllViews(): ViewDefinition[];
    onRegistryChange(listener: (event: CustomEvent<ViewRegistryChangeDetail>) => void): () => void;
}

export const viewRegistry = new ViewRegistryLegacyApiImpl();

export const ViewRegistry: ViewRegistryApi = viewRegistry;
