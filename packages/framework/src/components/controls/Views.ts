import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../state/context';
import type { UiState, UiStateContextValue } from '../../state/ui-state';
import { createViewControlsHandlers } from '../../handlers/layout/view-controls.handlers';
import { ViewRegistry } from '../../registry/ViewRegistryInstance';
import type { ViewDefinition } from '../../types';

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
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 6px;
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
            flex-direction: row;
            align-items: center;
            gap: 4px;
            flex-wrap: nowrap;
        }

        .controls.column {
            flex-direction: column;
            align-items: stretch;
            gap: 6px;
        }

        .slot-strip {
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            gap: 4px;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
        }

        .slot {
            display: inline-flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 2px;
            height: 22px;
            min-width: 22px;
            padding: 2px;
            border-radius: 999px;
            border: 1px solid rgba(148, 163, 184, 0.35);
            background: transparent;
            color: #94a3b8;
            font-size: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
        }

        .slot--active {
            border-color: rgba(34, 197, 94, 0.9);
            background: rgba(34, 197, 94, 0.12);
            color: #d1fae5;
        }

        .slot--disabled {
            border-color: rgba(148, 163, 184, 0.2);
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
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 6px;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
        }

        .token {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            padding: 2px 4px;
            border-radius: 999px;
            border: 1px solid rgba(148, 163, 184, 0.35);
            background: rgba(15, 23, 42, 0.4);
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
            border-color: rgba(34, 197, 94, 0.9);
            background: rgba(34, 197, 94, 0.16);
            color: #ffffff;
        }

        .token__icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 14px;
            height: 14px;
            font-size: 14px;
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
            font-size: 12px;
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
        const label = this.getViewLabel(view);
        return label.replace(/[^a-z0-9]/gi, '').slice(0, 2) || view.id?.slice(0, 2) || '';
    }

    private canEnableSlot(slotNumber: number, capacity: number) {
        return slotNumber === capacity + 1;
    }

    private canDisableSlot(slotNumber: number, capacity: number) {
        return slotNumber === capacity && capacity > 1;
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

    private resolveMainViewOrder(): string[] {
        const layout = this.uiState?.layout ?? { mainAreaCount: 1, mainViewOrder: [] };
        const layoutOrder = Array.isArray(layout.mainViewOrder) ? layout.mainViewOrder : [];
        const panels = Array.isArray(this.uiState?.panels) ? this.uiState?.panels : [];
        const panelOrder: string[] = panels
            .filter((panel) => panel.region === 'main')
            .map((panel) => this.resolvePanelViewId(panel))
            .filter(Boolean);
        const mergedOrder: string[] = [...layoutOrder];
        panelOrder.forEach((viewId: string) => {
            if (!mergedOrder.includes(viewId)) {
                mergedOrder.push(viewId);
            }
        });
        const viewIds = new Set(ViewRegistry.getAllViews().map((view: ViewDefinition) => view.id));
        const deduped: string[] = mergedOrder.filter((viewId: string, index: number) =>
            mergedOrder.indexOf(viewId) === index && viewIds.has(viewId),
        );
        return deduped;
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

    private handleSlotDrop(event: DragEvent, slotIndex: number, isEnabled: boolean) {
        event.preventDefault();
        const viewId =
            event.dataTransfer?.getData('application/x-view-id') ||
            event.dataTransfer?.getData('text/plain');
        if (!viewId) {
            return;
        }

        const capacity = this.panelLimit;
        const slotNumber = slotIndex + 1;
        if (!isEnabled && !this.canEnableSlot(slotNumber, capacity)) {
            return;
        }

        const currentOrder = this.resolveMainViewOrder();
        const nextOrder: string[] = currentOrder.filter((id: string) => id !== viewId);
        nextOrder.splice(slotIndex, 0, viewId);
        const nextCapacity = isEnabled ? capacity : slotNumber;
        const limitedOrder = nextOrder.slice(0, nextCapacity);
        if (!isEnabled) {
            this.handlers.setMainAreaCount(slotNumber);
        }
        this.handlers.setMainViewOrder(limitedOrder);
    }

    private handleSlotDragOver(event: DragEvent, isEnabled: boolean, slotNumber: number) {
        const capacity = this.panelLimit;
        if (!isEnabled && !this.canEnableSlot(slotNumber, capacity)) {
            return;
        }
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
    }

    private handleSlotClick(slotIndex: number, viewId: string | null, isEnabled: boolean) {
        const capacity = this.panelLimit;
        const slotNumber = slotIndex + 1;

        if (!isEnabled) {
            if (this.canEnableSlot(slotNumber, capacity)) {
                this.handlers.setMainAreaCount(slotNumber);
            }
            return;
        }

        if (this.canDisableSlot(slotNumber, capacity)) {
            this.handlers.setMainAreaCount(slotNumber - 1);
            return;
        }

        if (viewId) {
            const nextOrder = this.resolveMainViewOrder().filter((id: string) => id !== viewId);
            this.handlers.setMainViewOrder(nextOrder);
        }
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

    private handleTokenDrop(event: DragEvent, targetViewId: string) {
        event.preventDefault();
        const viewId =
            event.dataTransfer?.getData('application/x-view-id') ||
            event.dataTransfer?.getData('text/plain');
        if (!viewId || viewId === targetViewId) {
            return;
        }
        const currentOrder = this.resolveTokenViewOrder();
        const fromIndex = currentOrder.indexOf(viewId);
        const toIndex = currentOrder.indexOf(targetViewId);
        if (fromIndex === -1 || toIndex === -1) {
            return;
        }
        const nextOrder: string[] = currentOrder.filter((id: string) => id !== viewId);
        nextOrder.splice(toIndex, 0, viewId);
        this.handlers.setMainViewOrder(nextOrder);
    }

    private handleTokenDropOnList(event: DragEvent) {
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
        const nextOrder: string[] = currentOrder.filter((id: string) => id !== viewId);
        nextOrder.push(viewId);
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
            <div class="controls" @click=${this.handlers.stopClickPropagation}>
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
                        const slotStatus = isActive ? 'active' : 'inactive';
                        const slotLabel = isActive ? label : `Slot ${index + 1}`;
                        const slotClass = [
                            'slot',
                            isActive ? 'slot--active' : '',
                            !isEnabled ? 'slot--disabled' : '',
                        ]
                            .filter(Boolean)
                            .join(' ');

                        return html`
                            <button
                                class="${slotClass}"
                                aria-disabled=${!isEnabled}
                                aria-label=${slotLabel}
                                @dragover=${(event: DragEvent) =>
                                    this.handleSlotDragOver(event, isEnabled, index + 1)}
                                @drop=${(event: DragEvent) => this.handleSlotDrop(event, index, isEnabled)}
                                @click=${() => this.handleSlotClick(index, viewId, isEnabled)}
                                title=${slotLabel}
                            >
                                <span class="slot__label">
                                    ${iconName
                                        ? html`<i class="codicon codicon-${iconName}"></i>`
                                        : html`${index + 1}`}
                                </span>
                                <span class="slot__title">
                                    ${view ? label : isEnabled ? `Slot ${index + 1}` : 'Disabled'}
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
                    @drop=${this.handleTokenDropOnList}
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
                                    class="token ${isActive ? 'token--active' : ''}"
                                    draggable="true"
                                    role="listitem"
                                    title=${label}
                                    aria-label=${label}
                                    @dragstart=${(event: DragEvent) =>
                                        this.handleTokenDragStart(event, view.id)}
                                    @dragover=${this.handleTokenDragOver}
                                    @drop=${(event: DragEvent) => this.handleTokenDrop(event, view.id)}
                                >
                                    <span class="token__icon">
                                        ${iconName
                                            ? html`<i class="codicon codicon-${iconName}"></i>`
                                            : ''}
                                    </span>
                                    <span>${label}</span>
                                    <span class="token__actions">
                                        <button
                                            class="token__move"
                                            type="button"
                                            aria-label="Move ${label} up"
                                            @click=${() => this.moveToken(view.id, 'up')}
                                        >
                                            <i class="codicon codicon-arrow-up"></i>
                                        </button>
                                        <button
                                            class="token__move"
                                            type="button"
                                            aria-label="Move ${label} down"
                                            @click=${() => this.moveToken(view.id, 'down')}
                                        >
                                            <i class="codicon codicon-arrow-down"></i>
                                        </button>
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
