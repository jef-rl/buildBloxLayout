import { LitElement, html, css, nothing } from 'lit';
import { ContextConsumer } from '@lit/context';
import type { CoreContext } from '../../runtime/context/core-context';
import { coreContext } from '../../runtime/context/core-context-key';
import { canDragViewsSelectorKey } from '../../selectors/layout/can-drag-views.selector';
import { viewDefinitionsSelectorKey } from '../../selectors/views/view-definitions.selector';
import type { ViewDefinitionSummary, UIState } from '../../types/state';
import { ActionCatalog } from '../../runtime/actions/action-catalog';
// import { Icons } from '../../../components/Icons';

/**
 * Lightweight registry viewer intended to live inside a dock container.
 * Displays the currently registered view definitions so admins can confirm
 * what is available without leaving design mode.
 */
export class ViewRegistryPanel extends LitElement {
    private core: CoreContext<UIState> | null = null;
    private viewDefinitions: ViewDefinitionSummary[] = [];
    private canDragViews = false;
    private _consumer = new ContextConsumer(this, {
        context: coreContext,
        subscribe: true,
        callback: (value: CoreContext<UIState> | undefined) => {
            this.core = value ?? null;
            this.refreshFromState();
        },
    });

    /**
     * Determines if the view items should be draggable.
     * @returns {boolean} True if the user is an admin and in design mode.
     */
    private isDraggable(): boolean {
        return this.canDragViews;
    }

    /**
     * Handles the drag start event for a registry item.
     * Sets the view ID in the data transfer object.
     * @param {DragEvent} event - The drag event.
     * @param {string} viewId - The ID of the view being dragged.
     */
    private handleDragStart(event: DragEvent, viewId: string): void {
        if (event.dataTransfer) {
            event.dataTransfer.setData('text/plain', viewId);
            event.dataTransfer.effectAllowed = 'move';
        }
    }

    /**
     * Handles clicking on a registry view item.
     * Dispatches an action to toggle the view open/close.
     * @param {string} viewId - The ID of the view.
     */
    private handleClickView(viewId: string): void {
        if (!this.core) {
            return;
        }

        this.core.dispatch({
            action: ActionCatalog.ViewsToggleView,
            payload: { viewId },
        });
    }

    /**
     * Updates the view definitions from state.
     */
    private refreshFromState(): void {
        if (!this.core) {
            this.viewDefinitions = [];
            this.canDragViews = false;
            this.requestUpdate();
            return;
        }

        this.viewDefinitions = this.core.select(viewDefinitionsSelectorKey);
        this.canDragViews = this.core.select(canDragViewsSelectorKey);
        this.requestUpdate();
    }

    render() {
        if (!this.viewDefinitions?.length) {
            return html`
                <div class="empty-state">
                    No view definitions registered.
                </div>
            `;
        }

        const sortedViews = [...this.viewDefinitions].sort((a, b) => {
            const groupCompare = (a.group || '').localeCompare(b.group || '');
            if (groupCompare !== 0) return groupCompare;
            return (a.title || '').localeCompare(b.title || '');
        });

        return html`
            <div class="panel">
                <div class="panel-header">
                    <h3 class="title">Registered Views</h3>
                    <span class="count">${this.viewDefinitions.length}</span>
                </div>
                <div class="view-list">
                    ${sortedViews.map(view => html`
                        <div
                            class="view-item ${view.isOpen ? 'active' : ''}"
                            draggable=${this.isDraggable() ? 'true' : 'false'}
                            @dragstart=${(e: DragEvent) => this.handleDragStart(e, view.id)}
                            @click=${() => this.handleClickView(view.id)}
                        >
                            <div class="view-content">
                                <div class="view-title">${view.title || view.id}</div>
                                ${view.group ? html`<div class="view-group">${view.group}</div>` : nothing}
                            </div>
                            <div class="view-status">
                                ${view.isSystem ? html`<span class="badge">System</span>` : nothing}
                                <span class="status-indicator ${view.isOpen ? 'open' : 'closed'}"></span>
                            </div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    static styles = css`
        :host {
            display: block;
            height: 100%;
            font-family: 'Inter', sans-serif;
            color: #e5e7eb;
        }

        .panel {
            display: flex;
            flex-direction: column;
            height: 100%;
            background: #111827;
            border-radius: 8px;
            overflow: hidden;
        }

        .panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            border-bottom: 1px solid #1f2937;
        }

        .title {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin: 0;
        }

        .count {
            background: #1f2937;
            color: #9ca3af;
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 12px;
        }

        .view-list {
            flex: 1;
            overflow-y: auto;
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .view-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            border-radius: 6px;
            background: #1f2937;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .view-item:hover {
            background: #374151;
        }

        .view-item.active {
            border-left: 3px solid #2563eb;
            padding-left: 9px;
            background: #1e3a8a;
        }

        .view-content {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .view-title {
            font-size: 13px;
            font-weight: 500;
            line-height: 1.2;
        }

        .view-group {
            font-size: 11px;
            color: #9ca3af;
        }

        .view-status {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .badge {
            background: #1d4ed8;
            color: #dbeafe;
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 8px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #6b7280;
        }

        .status-indicator.open {
            background: #10b981;
        }

        .status-indicator.closed {
            background: #ef4444;
        }

        .empty-state {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #6b7280;
            font-size: 12px;
            background: #111827;
            border-radius: 8px;
        }
    `;
}
