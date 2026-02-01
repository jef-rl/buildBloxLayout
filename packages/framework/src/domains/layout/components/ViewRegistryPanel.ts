import { LitElement, html, css, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';
import type { ViewDefinitionSummary } from '../../../types/state';
// import { Icons } from '../../../components/Icons';

/**
 * Lightweight registry viewer intended to live inside a dock container.
 * Displays the currently registered view definitions so admins can confirm
 * what is available without leaving design mode.
 */
export class ViewRegistryPanel extends LitElement {
    private uiState: UiStateContextValue['state'] | null = null;
    private uiDispatch: UiStateContextValue['dispatch'] | null = null;
    private _consumer = new ContextConsumer(this, {
        context: uiStateContext,
        subscribe: true,
        callback: (value: UiStateContextValue | undefined) => {
            this.uiState = value?.state ?? null;
            this.uiDispatch = value?.dispatch ?? null;
            this.requestUpdate();
        },
    });

    /**
     * Determines if the view items should be draggable.
     * @returns {boolean} True if the user is an admin and in design mode.
     */
    private isDraggable(): boolean {
        return Boolean(this.uiState?.auth?.isAdmin && this.uiState?.layout?.inDesign);
    }

    /**
     * Handles the drag start event for a registry item.
     * Sets the view ID in the data transfer object.
     * @param {DragEvent} event - The drag event.
     * @param {string} viewId - The ID of the view being dragged.
     */
    private handleDragStart(event: DragEvent, viewId: string) {
        if (!event.dataTransfer || !this.uiState) {
            event.preventDefault(); // Prevent default if not draggable or no dataTransfer
            return;
        }

        event.dataTransfer.setData('application/x-view-id', viewId);
        event.dataTransfer.effectAllowed = 'move';

        // Find the view definition to get its title for the drag ghost
        const viewDefinition = this.uiState.viewDefinitions.find(v => v.id === viewId);
        const dragTitle = viewDefinition?.title || 'View';

        // Create a custom drag ghost element
        const ghost = document.createElement('div');
        ghost.style.cssText = `
            position: absolute;
            top: -1000px;
            left: -1000px;
            padding: 8px 12px;
            background: #1e293b;
            color: white;
            border: 1px solid #3b82f6;
            border-radius: 4px;
            font-size: 13px;
            font-family: var(--theme-font-family, 'sans-serif');
            white-space: nowrap;
            z-index: 9999;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        `;
        ghost.textContent = dragTitle;
        document.body.appendChild(ghost);

        // Set the custom drag image and remove the ghost after a short delay
        event.dataTransfer.setDragImage(ghost, 10, 10);
        setTimeout(() => document.body.removeChild(ghost), 0);

        // Dispatch the action to notify the global state
        this.uiDispatch?.({ type: 'layout/dragStart', viewId });
    }

    /**
     * Handles the drag end event to clean up the global state.
     */
    private handleDragEnd() {
        this.uiDispatch?.({ type: 'layout/dragEnd' });
    }

    private renderRegistryItem(view: ViewDefinitionSummary) {
        const isDraggable = this.isDraggable();
        // Explicitly set draggable="true" string when enabled, instead of boolean attribute
        const draggableAttr = isDraggable ? 'true' : 'false';
        
        return html`
            <div
                class="registry-item ${isDraggable ? 'is-draggable' : ''}"
                draggable="${draggableAttr}"
                @dragstart=${(e: DragEvent) => this.handleDragStart(e, view.id)}
                @dragend=${this.handleDragEnd}
            >
                <div class="item-icon"></div>
                <div class="item-details">
                    <div class="item-title">${view.title}</div>
                    <div class="item-id">${view.id}</div>
                </div>
            </div>
        `;
    }

    override render() {
        if (!this.uiState) {
            return nothing;
        }

        const views = this.uiState.viewDefinitions ?? [];
        const isDraggable = this.isDraggable();

        return html`
            <div class="registry-list">
                ${views.map((view) => this.renderRegistryItem(view))}
            </div>
        `;
    }

    static override styles = css`
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
            // background-color: var(--theme-color-surface-1, #2c2c2c);
            color: var(--theme-color-on-surface, #ffffff);
            font-family: var(--theme-font-family, 'sans-serif');
            font-size: 13px;
            overflow: hidden;
        }

    

        .registry-list {
            flex-grow: 1;
            max-height: 40vh;
            overflow-y: auto;
            padding: 8px 0 0 0;
        }

        .registry-item {
        position: relative;
    display: flex;
    align-items: center;
    padding: 4px 16px;
    margin-bottom: 4px;
    /* border-left: 3px solid transparent; */
    transition: background-color 0.2s ease, border-color 0.2s ease;
    pointer-events: auto;
        }

        .registry-item.is-draggable {
            cursor: grab;
            user-select: none; /* Prevent text selection */
        }

        .registry-item.is-draggable:hover {
            background-color: rgba(255, 255, 255, 0.05);
            border-left-color: var(--theme-color-primary, #007bff);
        }

        /* Make children non-interactive so the drag starts on the parent */
        .registry-item.is-draggable * {
            pointer-events: none;
        }

        .item-icon {
            margin-right: 12px;
            flex-shrink: 0;
        }
        .item-icon svg {
            width: 20px;
            height: 20px;
            fill: var(--theme-color-on-surface-variant, #aaa);
        }

        .item-details {
            display: flex;
            flex-direction: column;
        }

        .item-title {
            font-weight: 500;
            color: var(--theme-color-on-surface, #fff);
        }

        .item-id {
            font-family: var(--theme-font-family-monospace, 'monospace');
            font-size: 11px;
            color: var(--theme-color-on-surface-variant, #aaa);
        }
    `;
}

if (!customElements.get('view-registry-panel')) {
    customElements.define('view-registry-panel', ViewRegistryPanel);
}
