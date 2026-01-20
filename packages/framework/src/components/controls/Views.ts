import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../state/context';
import type { UiState, UiStateContextValue } from '../../state/ui-state';
import { createViewControlsHandlers } from '../../handlers/layout/view-controls.handlers';
import { ViewRegistry } from '../../registry/ViewRegistryInstance';
import type { ViewDefinition } from '../../types';
import { Icons } from '../ui/Icons';

export class ViewControls extends LitElement {
    @property({ type: String }) orientation = 'row';

    private uiState: UiStateContextValue['state'] | null = null;
    private uiDispatch: UiStateContextValue['dispatch'] | null = null;
    private registryUnsubscribe: (() => void) | null = null;
    private _consumer = new ContextConsumer(this, {
        context: uiStateContext,
        subscribe: true,
        callback: (value: UiStateContextValue | undefined) => {
            this.uiState = value?.state ?? null;
            this.uiDispatch = value?.dispatch ?? null;
            this.requestUpdate();
        },
    });
    private handlers = createViewControlsHandlers(this, () => this.uiDispatch);

    static styles = css`
        :host {
            display: block;
        }

        .controls {
            display: grid;
            gap: 2px;
            padding: 0;
            background: transparent;
            border: none;
            border-radius: 0;
            min-width: unset;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
        }

        .controls.row {
            grid-template-columns: 1fr;
            gap: 0px;
            grid-template-rows: 16px 24px;
        }

        .controls.column {
            grid-template-rows: auto 1fr;
            align-items: stretch;
            gap: 6px;
        }

        .slot-strip {
            display: grid;
            grid-auto-columns: 24px;
            align-items: center;
            gap: 2px 0px;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            z-index: 10;
            grid-area: 1 / 1 / 3 / 6;
            grid-auto-flow: column;
            padding-bottom: 16px;
            min-height: 40px;
        }

        .slot {
            display: inline-flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 0px;
            height: 40px;
            min-width: 24px;
            padding: 0px;
            border-radius: 4px 4px 0 0;
            border: transparent solid;
            border-width: 0 0 24px 0;
            background: transparent;
            color: #94a3b8;
            font-size: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
        }

        .slot--active {
            border-color: rgb(0,64,32);
            background: rgb(0, 64, 32);
            color: #d1fae5;
        }

        .slot--disabled {
            border-color: rgba(148, 163, 184, 1);
            background: transparent;
            color: rgba(148, 163, 184, 0.4);
            cursor: not-allowed;
        }

        .slot__label {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 16px;
            height: 16px;
            padding: 0;
            border-radius: 999px;
            font-size: 14px;
        }

        .slot__title {
            display: none;
        }

        .token-pool {
            display: grid;
            align-items: center;
            gap: 0px;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            grid-area: 2 / 1 / 3 / -1;
            z-index: 100;
            grid-auto-columns: 24px;
            grid-auto-flow: column;
        }

        .token {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            padding: 2px 4px;
            border-radius: 4px;

            color: #cbd5f5;
            font-size: 10px;
            font-weight: 600;
            cursor: grab;
            transition: border-color 0.2s ease, background-color 0.2s ease;
        }

        .token:active {
            cursor: grabbing;
        }

        .token--active {

            color: #ffffff;
        }

        .token__icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 14px;
            height: 14px;
        }

        .token__icon img {
            width: 14px;
            height: 14px;
        }

        .token__actions {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .token:focus-within .token__actions,
        .token:hover .token__actions {
            opacity: 1;
        }

        .token__move {
            border: none;
            background: transparent;
            color: rgba(203, 213, 245, 0.7);
            font-size: 10px;
            cursor: pointer;
            padding: 2px;
            line-height: 1;
        }

        .token__move:focus-visible {
            outline: 1px solid rgba(148, 163, 184, 0.6);
            border-radius: 4px;
        }

        .icon-button {
            position: relative;
            padding: 6px;
            border-radius: 999px;
            border: none;
            background: transparent;
            color: #9ca3af;
            cursor: pointer;
            transition: background-color 0.2s ease, color 0.2s ease;
        }

        .icon-button:hover {
            color: #ffffff;
            background-color: rgba(17, 24, 39, 0.5);
        }

        .icon {
            width: 18px;
            height: 18px;
        }

        .slot-strip--column {
            flex-direction: column;
            align-items: stretch;
            gap: 6px;
        }

        .slot-strip--column .slot {
            width: 100%;
            min-width: 0;
            height: 28px;
            padding: 4px 8px;
            flex-direction: column;
            gap: 4px;
        }

        .token-pool--column {
            flex-direction: column;
            align-items: stretch;
            flex-wrap: nowrap;
            gap: 4px;
        }

        .token-pool--column .token {
            width: 100%;
            justify-content: space-between;
            padding: 2px 6px;
        }

        .token-pool--column .token__icon {
            height: 14px;
            min-width: 14px;
        }

        .controls.row .token {
            padding: 2px 4px;
            font-size: 9px;
        }
    `;

    connectedCallback() {
        super.connectedCallback();
        this.registryUnsubscribe = ViewRegistry.onRegistryChange(() => {
            this.requestUpdate();
        });
    }

    disconnectedCallback() {
        if (this.registryUnsubscribe) {
            this.registryUnsubscribe();
            this.registryUnsubscribe = null;
        }
        super.disconnectedCallback();
    }

    get panelLimit() {
        const layout = this.uiState?.layout ?? { mainAreaCount: 1, mainViewOrder: [] };
        const rawCount = Number(layout.mainAreaCount ?? 1);
        const clamped = Math.min(5, Math.max(1, Number.isFinite(rawCount) ? rawCount : 1));
        return clamped;
    }

    private getViewLabel(view: { title?: string; name?: string; id?: string }) {
        return view.title || view.name || view.id || '';
    }

    private getViewIcon(view: { icon?: string; title?: string; name?: string; id?: string }) {
        if (view.icon) {
            return view.icon;
        }
        return Icons[Math.floor(Math.random() * Icons.length)];
    }

    private resolvePanelViewId(panel: { activeViewId?: string; viewId?: string; view?: unknown } | null) {
        return panel?.activeViewId ?? panel?.viewId ?? (panel as any)?.view?.component ?? null;
    }

    private resolveActiveMainViews() {
        const panels = Array.isArray(this.uiState?.panels) ? this.uiState?.panels : [];
        return panels
            .filter((panel) => panel.region === 'main')
            .map((panel) => this.resolvePanelViewId(panel))
            .filter(Boolean);
    }

    private resolveTokenViewOrder(): string[] {
        const layout = this.uiState?.layout ?? { mainAreaCount: 1, mainViewOrder: [] };
        const layoutOrder = Array.isArray(layout.mainViewOrder) ? layout.mainViewOrder : [];
        const views = ViewRegistry.getAllViews();
        const viewIds: string[] = views.map((view: ViewDefinition) => view.id);
        const ordered: string[] = layoutOrder.filter((viewId: string) => viewIds.includes(viewId));
        viewIds.forEach((viewId: string) => {
            if (!ordered.includes(viewId)) {
                ordered.push(viewId);
            }
        });
        return ordered;
    }

    private handleSlotClick(slotIndex: number) {
        this.handlers.setMainAreaCount(slotIndex + 1);
    }

    private handleTokenDragStart(event: DragEvent, viewId: string) {
        event.dataTransfer?.setData('application/x-view-id', viewId);
        event.dataTransfer?.setData('text/plain', viewId);
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
        }
    }

    private handleTokenDragOver(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
    }

    /**
     * Unified drop handler for the token pool.
     * Determines if the drop target is a specific token (to reorder)
     * or the container itself (to move to end).
     */
    private handleDrop(event: DragEvent) {
        event.preventDefault();
        const viewId =
            event.dataTransfer?.getData('application/x-view-id') ||
            event.dataTransfer?.getData('text/plain');

        if (!viewId) {
            return;
        }

        const currentOrder = this.resolveTokenViewOrder();
        if (!currentOrder.includes(viewId)) {
            return;
        }

        // Find if we dropped onto another token
        const targetToken = (event.target as HTMLElement).closest('.token');
        const targetViewId = targetToken?.getAttribute('data-view-id');

        const nextOrder: string[] = currentOrder.filter((id: string) => id !== viewId);

        if (targetViewId && targetViewId !== viewId) {
            // Reorder: Insert dropped token before the target token
            const toIndex = nextOrder.indexOf(targetViewId);
            if (toIndex !== -1) {
                nextOrder.splice(toIndex, 0, viewId);
            } else {
                nextOrder.push(viewId);
            }
        } else {
            // Dropped on container or same token: Move to end
            nextOrder.push(viewId);
        }

        this.handlers.setMainViewOrder(nextOrder);
    }

    private moveToken(viewId: string, direction: 'up' | 'down') {
        const currentOrder = this.resolveTokenViewOrder();
        const index = currentOrder.indexOf(viewId);
        if (index === -1) {
            return;
        }
        const offset = direction === 'up' ? -1 : 1;
        const nextIndex = index + offset;
        if (nextIndex < 0 || nextIndex >= currentOrder.length) {
            return;
        }
        const nextOrder = [...currentOrder];
        nextOrder.splice(index, 1);
        nextOrder.splice(nextIndex, 0, viewId);
        this.handlers.setMainViewOrder(nextOrder);
    }

    render() {
        const isRow = this.orientation === 'row';
        const views = ViewRegistry.getAllViews();
        const viewMap = new Map(views.map((view: ViewDefinition) => [view.id, view]));
        const activeOrder = this.resolveActiveMainViews();
        const activeSet = new Set(activeOrder);
        const capacity = this.panelLimit;
        const slotStripClass = `slot-strip ${isRow ? 'slot-strip--row' : 'slot-strip--column'}`;
        const tokenPoolClass = `token-pool ${isRow ? 'token-pool--row' : 'token-pool--column'}`;
        const controlsClass = `controls ${isRow ? 'row' : 'column'}`;
        const tokenOrder = this.resolveTokenViewOrder();

        return html`
            <div class="${controlsClass}" @click=${this.handlers.stopClickPropagation}>
                <div class="${slotStripClass}">
                    ${Array.from({ length: 5 }).map((_, index) => {
            const viewId = activeOrder[index] ?? null;
            const view = viewId ? views.find((item) => item.id === viewId) : null;
            const label = view ? this.getViewLabel(view) : '';
            const iconName = view
                ? this.getViewIcon(view)
                : viewId
                    ? this.getViewIcon({ id: viewId })
                    : '';
            const isEnabled = index < capacity;
            const isActive = Boolean(viewId);
            const slotLabel = isActive ? label : `Slot ${index + 1}`;
            const slotClass = [
                'slot',
                isEnabled ? 'slot--active' : '',
            ]
                .filter(Boolean)
                .join(' ');

            return html`
                            <button
                                class="${slotClass}"
                                aria-label=${slotLabel}
                                @click=${() => this.handleSlotClick(index)}
                                title=${slotLabel}
                            >
                                <span class="slot__label">
                                    ${index + 1}
                                </span>
                                <span class="slot__title">
                                    ${view ? label : `Slot ${index + 1}`}
                                </span>
                            </button>
                        `;
        })}
                </div>

                <div
                    class="${tokenPoolClass}"
                    role="list"
                    aria-label="View tokens"
                    @dragover=${this.handleTokenDragOver}
                    @drop=${(event: DragEvent) => this.handleDrop(event)}
                >
                    ${tokenOrder
                .map((viewId: string) => viewMap.get(viewId))
                .filter((view?: ViewDefinition): view is ViewDefinition => !!view)
                .map((view: ViewDefinition) => {
                    const label = this.getViewLabel(view);
                    const iconName = this.getViewIcon(view);
                    const isActive = activeSet.has(view.id);
                    return html`
                                <div
                                    class="token"
                                    data-view-id=${view.id}
                                    draggable="true"
                                    role="listitem"
                                    title=${label}
                                    aria-label=${label}
                                    @dragstart=${(event: DragEvent) =>
                            this.handleTokenDragStart(event, view.id)}
                                >
                                    <span class="token__icon">
                                        <img src="https://storage.googleapis.com/lozzuck.appspot.com/blox/icons/${iconName}.png" alt="${label}" />
                                    </span>
                              
                                </div>
                            `;
                })}

                    <button
                        @click=${this.handlers.resetSession}
                        class="icon-button"
                        title="New Session / Reset"
                    >
                        <i class="icon codicon codicon-refresh"></i>
                    </button>
                </div>
            </div>
        `;
    }
}

customElements.define('view-controls', ViewControls);
