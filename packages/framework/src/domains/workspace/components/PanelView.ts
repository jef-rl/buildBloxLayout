import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';
import type { View, ViewInstance } from '../../../types/index';
import { viewRegistry } from '../../../core/registry/view-registry';

export class PanelView extends LitElement {
    @property({ type: String }) panelId: string | null = null;
    @property({ type: String }) viewId: string | null = null;
    @property({ type: String }) viewInstanceId: string | null = null;
    private uiState: UiStateContextValue['state'] | null = null;
    private uiDispatch: UiStateContextValue['dispatch'] | null = null;
    private registryUnsubscribe: (() => void) | null = null;
    @state() private isDropReady = false;

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

        .design-overlay {
            position: absolute;
            inset: 0;
            border: 2px dashed transparent;
            border-radius: 8px;
            background: transparent;
            z-index: 2;
            pointer-events: none;
            transition: border-color 0.15s ease, background-color 0.15s ease, opacity 0.15s ease;
            opacity: 0;
        }

        .design-overlay.active {
            pointer-events: auto;
            opacity: 1;
            background: rgba(59, 130, 246, 0.08);
            border-color: rgba(59, 130, 246, 0.4);
        }

        .design-overlay.ready {
            border-color: #22d3ee;
            background: rgba(34, 211, 238, 0.12);
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

        // 1. Check new View Instances
        const instance = this.uiState.viewInstances?.[this.viewId];
        if (instance) {
            return { definitionId: instance.definitionId, instance };
        }

        // 2. Check Legacy View Array
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

        // 3. Fallback: viewId IS the definitionId
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
        
        // Only reload if the viewId has actually changed or definition changed
        const currentElement = container.firstElementChild as HTMLElement | null;
        
        // Cache Key: Instance ID (preferred) or View ID (fallback)
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
        
        // Re-use current element if it matches (optimistic update)
        if (currentElement && definition && currentElement.tagName.toLowerCase() === definition.tag) {
            this.applyViewData(currentElement, instance);
            return;
        }
        
        container.innerHTML = '';
        if (!definition?.tag) {
            // Avoid calling requestUpdate() here to prevent update loops.
            // The renderFallback() method handles UI for missing definitions.
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
            // Legacy data support
            (element as any).data = instance.localContext;
            
            // Apply common props if they exist on the element type
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

    private isDropOverlayActive(): boolean {
        return Boolean(
            this.uiState?.layout?.inDesign &&
            this.uiState?.auth?.isAdmin &&
            this.uiState?.layout?.draggedViewId
        );
    }

    private resolveDraggedViewId(event: DragEvent): string | null {
        return (
            event.dataTransfer?.getData('application/x-view-id') ||
            event.dataTransfer?.getData('text/plain') ||
            null
        );
    }

    private handleDragStart(event: DragEvent) {
        // Only allow dragging if we have a view
        const { instance } = this.resolveViewData();
        const draggableId = instance?.instanceId || this.viewId;
        
        if (!draggableId) {
            event.preventDefault();
            return;
        }

        if (event.dataTransfer) {
            event.dataTransfer.setData('application/x-view-id', draggableId);
            event.dataTransfer.setData('text/plain', draggableId);
            event.dataTransfer.effectAllowed = 'move';
            
            // Custom Drag Image
            const ghost = this.cloneNode(true) as HTMLElement;
            ghost.style.position = 'absolute';
            ghost.style.top = '-1000px';
            ghost.style.left = '-1000px';
            ghost.style.width = '200px'; // Approx width
            ghost.style.height = '40px'; // Approx header height
            ghost.style.background = '#1e293b';
            ghost.style.border = '2px solid #3b82f6';
            ghost.style.borderRadius = '4px';
            ghost.style.opacity = '1';
            ghost.style.zIndex = '9999';
            
            // Just show the ID/Title if possible
            ghost.innerHTML = `<div style="padding: 8px; color: white;">${instance?.title || 'View'}</div>`;
            
            document.body.appendChild(ghost);
            event.dataTransfer.setDragImage(ghost, 10, 10);
            setTimeout(() => document.body.removeChild(ghost), 0);
        }
    }

    private handleDragEnter(event: DragEvent) {
        if (!this.isDropOverlayActive()) {
            return;
        }
        event.preventDefault();
        this.isDropReady = true;
    }

    private handleDragOver(event: DragEvent) {
        if (!this.isDropOverlayActive()) {
            return;
        }
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
        this.isDropReady = true;
    }

    private handleDragLeave(event: DragEvent) {
        const overlay = event.currentTarget as HTMLElement | null;
        const relatedTarget = event.relatedTarget as Node | null;
        if (overlay && relatedTarget && overlay.contains(relatedTarget)) {
            return;
        }
        this.isDropReady = false;
    }

    private handleDrop(event: DragEvent) {
        if (!this.isDropOverlayActive()) {
            return;
        }
        event.preventDefault();
        const viewId = this.resolveDraggedViewId(event);
        const panelId = this.panelId;
        this.isDropReady = false;
        if (!viewId || !panelId) {
            return;
        }
        this.uiDispatch?.({ type: 'panels/assignView', viewId, panelId });
    }

    private renderFallback() {
        let message = '';
        if (!this.viewId) {
            message = 'No view selected.';
        } else {
            // Check if we have an instance or def
            const { definitionId } = this.resolveViewData();
            
            if (!definitionId) {
                // message = `View "${this.viewId}" cannot be resolved.`;
                // Don't show error immediately, as it might be loading state
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
        const overlayActive = this.isDropOverlayActive();
        // Allow dragging if a view is present
        const canDrag = !!this.viewId;

        return html`
            <div
                class="view-wrapper"
                draggable="${canDrag ? 'true' : 'false'}"
                @dragstart=${this.handleDragStart}
                @dragenter=${this.handleDragEnter}
                @dragover=${this.handleDragOver}
                @dragleave=${this.handleDragLeave}
                @drop=${this.handleDrop}
            >
                <div class="view-container"></div>
                <div
                    class="design-overlay ${overlayActive ? 'active' : ''} ${this.isDropReady ? 'ready' : ''}"
                ></div>
                ${this.renderFallback()}
            </div>
        `;
    }
}

customElements.define('panel-view', PanelView);
