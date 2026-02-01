// Toolbar view
// TODO: Extract from domains/workspace/components/ToolbarView.ts

import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';
import type { View, ViewInstance } from '../../../types/index';
import { viewRegistry } from '../../../core/registry/view-registry';

export class ToolbarView extends LitElement {
    @property({ type: String }) panelId: string | null = null;
    @property({ type: String }) viewId: string | null = null;
    @property({ type: String }) viewInstanceId: string | null = null;
    private uiState: UiStateContextValue['state'] | null = null;
    private uiDispatch: UiStateContextValue['dispatch'] | null = null;
    private registryUnsubscribe: (() => void) | null = null;

    private _consumer = new ContextConsumer(this, {
        context: uiStateContext,
        subscribe: true,
        callback: (value: UiStateContextValue | undefined) => {
            this.uiState = value?.state ?? null;
            this.uiDispatch = value?.dispatch ?? null;
            this.updateElementData();
            this.requestUpdate();
        },
    });

    static styles = css`
        :host {
            display: block;
            height: 100%;
            width: 100%;
            position: relative;
        }

        .view-wrapper {
            position: relative;
            height: 100%;
            width: 100%;
        }

        .view-container {
            height: 100%;
            width: 100%;
            position: relative;
            z-index: 1;
        }

        .fallback {
            display: grid;
            place-items: center;
            height: 100%;
            color: #9ca3af;
            font-size: 0.9rem;
            position: absolute;
            inset: 0;
            z-index: 0;
        }
    `;

    connectedCallback() {
        super.connectedCallback();
        this.registryUnsubscribe = viewRegistry.onRegistryChange(() => {
            if (this.viewId) {
                void this.loadView();
            }
        });
    }

    disconnectedCallback() {
        if (this.registryUnsubscribe) {
            this.registryUnsubscribe();
            this.registryUnsubscribe = null;
        }
        super.disconnectedCallback();
    }

    updated(changedProps: Map<string, unknown>) {
        if (changedProps.has('viewId') || changedProps.has('viewInstanceId')) {
            void this.loadView();
        }
    }

    private resolveViewData(): { definitionId: string | null; instance: ViewInstance | null } {
        if (!this.uiState || !this.viewId) {
            return { definitionId: null, instance: null };
        }

        const instance = this.uiState.viewInstances?.[this.viewId];
        if (instance) {
            return { definitionId: instance.definitionId, instance };
        }

        const legacyView = this.uiState.views?.find(v => v.id === this.viewId);
        if (legacyView) {
             return { 
                 definitionId: legacyView.component, 
                 instance: {
                     instanceId: legacyView.id,
                     definitionId: legacyView.component,
                     title: legacyView.name,
                     localContext: (legacyView.data as Record<string, any>) || {}
                 }
             };
        }

        const def = viewRegistry.get(this.viewId);
        if (def) {
            return { definitionId: this.viewId, instance: null };
        }

        return { definitionId: null, instance: null };
    }

    private async loadView() {
        const container = this.shadowRoot?.querySelector('.view-container');
        if (!container) return;

        const { definitionId, instance } = this.resolveViewData();
        const definition = definitionId ? viewRegistry.get(definitionId) : null;
        
        const cacheKey = instance?.instanceId ?? this.viewId;

        const cachedElement = cacheKey ? viewRegistry.getElement(cacheKey) : undefined;
        if (cachedElement && definition && cachedElement.tagName.toLowerCase() === definition.tag) {
            this.applyViewData(cachedElement, instance);
            if (container.firstElementChild !== cachedElement) {
                container.innerHTML = '';
                container.appendChild(cachedElement);
            }
            return;
        }
        
        const currentElement = container.firstElementChild as HTMLElement | null;
        if (currentElement && definition && currentElement.tagName.toLowerCase() === definition.tag) {
            this.applyViewData(currentElement, instance);
            return;
        }
        
        container.innerHTML = '';
        if (!definition?.tag) {
            return;
        }

        await viewRegistry.getComponent(definition.id);
        const element = document.createElement(definition.tag);
        if (cacheKey) {
            viewRegistry.setElement(cacheKey, element);
        }
        this.applyViewData(element, instance);
        container.appendChild(element);
    }

    private applyViewData(element: HTMLElement, instance: ViewInstance | null) {
        if (instance) {
            (element as any).instanceId = instance.instanceId;
            (element as any).context = instance.localContext;
            (element as any).data = instance.localContext;
            
            const ctx = instance.localContext || {};
            if (typeof ctx.label === 'string') {
                (element as { label?: string }).label = ctx.label;
            }
            if (typeof ctx.color === 'string') {
                (element as { color?: string }).color = ctx.color;
            }
        }
    }

    private updateElementData() {
        const container = this.shadowRoot?.querySelector('.view-container');
        const element = container?.firstElementChild as HTMLElement | null;
        if (element) {
            const { instance } = this.resolveViewData();
            this.applyViewData(element, instance);
        }
    }

    private renderFallback() {
        let message = '';
        if (!this.viewId) {
            message = 'No view selected.';
        } else {
            const { definitionId } = this.resolveViewData();
            if (!definitionId) {
                // message = `View "${this.viewId}" cannot be resolved.`;
            } else {
                const definition = viewRegistry.get(definitionId);
                if (!definition) {
                     // message = `View definition "${definitionId}" is not registered.`;
                } else if (!definition.tag) {
                     message = `View definition "${definitionId}" is missing a tag.`;
                }
            }
        }

        if (message) {
            return html`
                <div class="fallback">
                    <slot>${message}</slot>
                </div>
            `;
        }
        return nothing;
    }

    render() {
        return html`
            <div class="view-wrapper">
                <div class="view-container"></div>
                ${this.renderFallback()}
            </div>
        `;
    }
}

customElements.define('toolbar-view', ToolbarView);
