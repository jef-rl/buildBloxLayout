import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';
import type { View } from '../../../types/index';
import { viewRegistry } from '../../../core/registry/view-registry';

export class PanelView extends LitElement {
    @property({ type: String }) viewId: string | null = null;
    @property({ type: String }) viewInstanceId: string | null = null;
    @property({ type: String }) panelId: string | null = null;

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
        }

        .drop-overlay {
            position: absolute;
            inset: 0;
            z-index: 2;
            pointer-events: none;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px dashed transparent;
            background: rgba(59, 130, 246, 0);
            transition: background 0.2s ease, border-color 0.2s ease;
        }

        .drop-overlay.active {
            pointer-events: auto;
        }

        .drop-overlay.ready {
            border-color: rgba(59, 130, 246, 0.9);
            background: rgba(59, 130, 246, 0.15);
        }

        .drop-overlay-label {
            color: #93c5fd;
            font-size: 0.85rem;
            font-weight: 600;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .drop-overlay.ready .drop-overlay-label {
            opacity: 1;
        }

        .fallback {
            display: grid;
            place-items: center;
            height: 100%;
            color: #9ca3af;
            font-size: 0.9rem;
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

    private async loadView() {
        const container = this.shadowRoot?.querySelector('.view-container');
        if (!container) return;

        // Only reload if the viewId has actually changed
        const currentElement = container.firstElementChild as HTMLElement | null;
        const definition = this.viewId ? viewRegistry.get(this.viewId) : null;
        const instanceId = this.viewInstanceId ?? null;

        const cachedElement = instanceId ? viewRegistry.getElement(instanceId) : undefined;
        if (cachedElement && definition && cachedElement.tagName.toLowerCase() === definition.tag) {
            this.applyViewData(cachedElement);
            container.innerHTML = '';
            container.appendChild(cachedElement);
            return;
        }
        if (currentElement && definition && currentElement.tagName.toLowerCase() === definition.tag) {
            this.applyViewData(currentElement);
            return;
        }
        
        container.innerHTML = '';
        if (!this.viewId || !definition?.tag) {
            this.requestUpdate(); // Request a render to show the fallback message
            return;
        }

        await viewRegistry.getComponent(this.viewId);
        const element = document.createElement(definition.tag);
        if (instanceId) {
            viewRegistry.setElement(instanceId, element);
        }
        this.applyViewData(element);
        container.appendChild(element);
    }

    private resolveViewData(): View | null {
        if (!this.uiState) {
            return null;
        }

        if (this.viewInstanceId) {
            const viewByInstance = this.uiState.views?.find(
                (view) => view.id === this.viewInstanceId
            );
            if (viewByInstance) return viewByInstance;
        }

        if (!this.viewId) {
            return null;
        }

        // Prioritize finding the view instance in the central state.views array
        const viewMatch = this.uiState.views?.find(
            (view) => view.component === this.viewId || view.id === this.viewId
        );
        if (viewMatch) return viewMatch;

        // Fallback for cases where panels might have transient view objects
        const panels = this.uiState.panels ?? [];
        const panelMatch = panels.find(
            (panel) =>
                panel?.viewId === this.viewId ||
                panel?.activeViewId === this.viewId ||
                panel?.view?.id === this.viewId ||
                panel?.view?.component === this.viewId
        );

        return panelMatch?.view ?? null;
    }

    private applyViewData(element: HTMLElement) {
        const view = this.resolveViewData();
        if (!view) {
            return;
        }

        const data = view.data;
        if (data && typeof data === 'object') {
            const viewData = data as { label?: unknown; color?: unknown };
            if (typeof viewData.label === 'string') {
                (element as { label?: string }).label = viewData.label;
            }
            if (typeof viewData.color === 'string') {
                (element as { color?: string }).color = viewData.color;
            }
            (element as { data?: unknown }).data = data;
        } else if (data !== undefined) {
            (element as { data?: unknown }).data = data;
        }
    }

    private updateElementData() {
        const container = this.shadowRoot?.querySelector('.view-container');
        const element = container?.firstElementChild as HTMLElement | null;
        if (element) {
            this.applyViewData(element);
        }
    }

    private isDropOverlayActive(): boolean {
        return Boolean(this.uiState?.layout?.inDesign && this.uiState?.auth?.isAdmin);
    }

    private resolveDraggedViewId(event: DragEvent): string | null {
        return (
            event.dataTransfer?.getData('application/x-view-id') ||
            event.dataTransfer?.getData('text/plain') ||
            null
        );
    }

    private handleDragEnter(event: DragEvent) {
        if (!this.isDropOverlayActive()) {
            return;
        }
        const viewId = this.resolveDraggedViewId(event);
        if (!viewId) {
            return;
        }
        event.preventDefault();
        this.isDropReady = true;
    }

    private handleDragOver(event: DragEvent) {
        if (!this.isDropOverlayActive()) {
            return;
        }
        const viewId = this.resolveDraggedViewId(event);
        if (!viewId) {
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
            const definition = viewRegistry.get(this.viewId);
            if (!definition) {
                message = `View "${this.viewId}" is not registered.`;
            } else if (!definition.tag) {
                message = `View "${this.viewId}" is missing a tag.`;
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
        // The container is always rendered.
        // Fallback content is now determined purely within the render cycle.
        return html`
            <div class="view-wrapper">
                <div class="view-container"></div>
                <div
                    class="drop-overlay ${overlayActive ? 'active' : ''} ${this.isDropReady ? 'ready' : ''}"
                    @dragenter=${this.handleDragEnter}
                    @dragover=${this.handleDragOver}
                    @dragleave=${this.handleDragLeave}
                    @drop=${this.handleDrop}
                >
                    <span class="drop-overlay-label">Drop view to assign</span>
                </div>
            </div>
            ${this.renderFallback()}
        `;
    }
}

customElements.define('panel-view', PanelView);
