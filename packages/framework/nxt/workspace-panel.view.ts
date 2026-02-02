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
            z-index: 50; /* Ensure above view content */
            pointer-events: none;
            transition: border-color 0.15s ease, background-color 0.15s ease, opacity 0.15s ease;
            opacity: 0;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-end;
            padding: 4px;
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

        .remove-btn {
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 4px;
            width: 24px;
            height: 24px;
            cursor: pointer;
            display: grid;
            place-items: center;
            font-size: 14px;
            line-height: 1;
            opacity: 0.8;
            transition: opacity 0.15s;
        }

        .remove-btn:hover {
            opacity: 1;
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

    private isDropOverlayActive(): boolean {
        return Boolean(
            this.uiState?.layout?.inDesign &&
            this.uiState?.auth?.isAdmin
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
        if (!this.isDropOverlayActive()) {
            event.preventDefault();
            return;
        }

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
            
            // Dispatch drag start
            this.uiDispatch?.({ type: 'layout/dragStart', viewId: draggableId });

            const ghost = this.cloneNode(true) as HTMLElement;
            ghost.style.position = 'absolute';
            ghost.style.top = '-1000px';
            ghost.style.left = '-1000px';
            ghost.style.width = '200px';
            ghost.style.height = '40px';
            ghost.style.background = '#1e293b';
            ghost.style.border = '2px solid #3b82f6';
            ghost.style.borderRadius = '4px';
            ghost.style.opacity = '1';
            ghost.style.zIndex = '9999';
            
            ghost.innerHTML = `<div style="padding: 8px; color: white;">${instance?.title || 'View'}</div>`;
            
            document.body.appendChild(ghost);
            event.dataTransfer.setDragImage(ghost, 10, 10);
            setTimeout(() => document.body.removeChild(ghost), 0);
        }
    }

    private handleDragEnd(event: DragEvent) {
        this.uiDispatch?.({ type: 'layout/dragEnd' });
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
        
        // Check if CTRL is held down
        const swap = event.ctrlKey;
        
        this.uiDispatch?.({ type: 'panels/assignView', viewId, panelId, swap });
    }

    private handleRemoveView(e: Event) {
        e.stopPropagation();
        if (this.panelId) {
            this.uiDispatch?.({ type: 'panels/removeView', panelId: this.panelId });
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
        const overlayActive = this.isDropOverlayActive();
        const canDrag = !!this.viewId && overlayActive;

        return html`
            <div
                class="view-wrapper"
                draggable="${canDrag ? 'true' : 'false'}"
                @dragstart=${this.handleDragStart}
                @dragend=${this.handleDragEnd}
                @dragenter=${this.handleDragEnter}
                @dragover=${this.handleDragOver}
                @dragleave=${this.handleDragLeave}
                @drop=${this.handleDrop}
            >
                <div class="view-container"></div>
                <div
                    class="design-overlay ${overlayActive ? 'active' : ''} ${this.isDropReady ? 'ready' : ''}"
                >
                    ${overlayActive && this.viewId ? html`
                        <button class="remove-btn" @click=${this.handleRemoveView} title="Remove View">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    ` : nothing}
                </div>
                ${this.renderFallback()}
            </div>
        `;
    }
}

customElements.define('panel-view', PanelView);
