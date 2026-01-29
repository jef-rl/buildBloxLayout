// @ts-nocheck
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';
import { createViewControlsHandlers } from '../handlers/view-controls.handlers';
import { createExpanderControlsHandlers } from '../handlers/expander-controls.handlers';
import type { ViewDefinitionSummary } from '../../../types/state';
import { Icons } from '../../../components/Icons';
import { toggleExpanderState, isExpanderPanelOpen } from '../../../utils/expansion-helpers.js';
import type { LayoutExpansion } from '../../../types/state.js';

export class Workspace extends LitElement {
    @property({ type: String }) orientation = 'row';

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
    private viewHandlers = createViewControlsHandlers(this, () => this.uiDispatch);
    private expanderHandlers = createExpanderControlsHandlers(this, () => this.uiDispatch);

    // Zoom state
    @property({ type: Number }) private zoomLevel = 1;

    static styles = css`
        :host {
            display: block;
        }

        .workspace-toolbar {
            display: grid;
            gap: 8px;
            padding: 4px 8px;
            background: #1e293b;
            border-radius: 6px;
            align-items: center;
            width: 100%;
            box-sizing: border-box;
        }

        .workspace-toolbar.row {
            grid-template-columns: auto 1fr auto auto;
            grid-template-areas: "expander views zoom scale";
        }

        .workspace-toolbar.column {
            grid-template-columns: 1fr;
            grid-template-areas:
                "expander"
                "views"
                "zoom"
                "scale";
        }

        /* Expander Controls Section */
        .expander-section {
            grid-area: expander;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .expander-section.column {
            flex-direction: column;
        }

        /* View Controls Section */
        .views-section {
            grid-area: views;
            display: grid;
            gap: 2px;
            min-width: 0;
        }

        .views-section.row {
            grid-template-columns: 1fr;
            grid-template-rows: 16px 24px;
        }

        .views-section.column {
            grid-template-rows: auto 1fr;
            gap: 6px;
        }

        /* Zoom Controls Section */
        .zoom-section {
            grid-area: zoom;
            display: flex;
            align-items: center;
            gap: 2px;
            background: #0f172a;
            padding: 2px;
            border-radius: 4px;
        }

        .zoom-button {
            padding: 4px 8px;
            border: none;
            background: transparent;
            color: #94a3b8;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            border-radius: 3px;
            transition: all 0.2s ease;
            min-width: 28px;
        }

        .zoom-button:hover {
            background: #1e293b;
            color: #e2e8f0;
        }

        .zoom-button.active {
            background: #3b82f6;
            color: white;
        }

        /* Scale Controls Section */
        .scale-section {
            grid-area: scale;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        /* Shared Button Styles */
        .icon-button {
            position: relative;
            padding: 6px;
            border-radius: 999px;
            border: none;
            background: transparent;
            color: #9ca3af;
            cursor: pointer;
            transition: background-color 0.2s ease, color 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .icon-button:hover {
            color: #ffffff;
            background-color: #374151;
        }

        .icon-button.active {
            color: #60a5fa;
            background-color: rgba(17, 24, 39, 0.5);
        }

        .icon {
            width: 18px;
            height: 18px;
        }

        .separator {
            background-color: #374151;
        }

        .separator.row {
            width: 1px;
            height: 16px;
            margin: 0 4px;
        }

        .separator.column {
            width: 16px;
            height: 1px;
            margin: 4px 0;
        }

        /* Slot Strip */
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

        /* Token Pool */
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

        .views-section.row .token {
            padding: 2px 4px;
            font-size: 9px;
        }
    `;

    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
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
        const uiState = this.uiState;
        const panels = uiState && Array.isArray(uiState.panels) ? uiState.panels : [];
        return panels
            .filter((panel) => panel.region === 'main')
            .map((panel) => this.resolvePanelViewId(panel))
            .filter(Boolean);
    }

    private resolveTokenViewOrder(): string[] {
        const layout = this.uiState?.layout ?? { mainAreaCount: 1, mainViewOrder: [] };
        const layoutOrder = Array.isArray(layout.mainViewOrder) ? layout.mainViewOrder : [];
        const views = this.uiState?.viewDefinitions ?? [];
        const viewIds: string[] = views.map((view: ViewDefinitionSummary) => view.id);
        const ordered: string[] = layoutOrder.filter((viewId: string) => viewIds.includes(viewId));
        viewIds.forEach((viewId: string) => {
            if (!ordered.includes(viewId)) {
                ordered.push(viewId);
            }
        });
        return ordered;
    }

    private handleSlotClick(slotIndex: number) {
        this.viewHandlers.setMainAreaCount(slotIndex + 1);
    }

    private handleTokenDragStart(event: DragEvent, viewId: string) {
        if (!event.dataTransfer) return;

        event.dataTransfer.setData('application/x-view-id', viewId);
        event.dataTransfer.setData('text/plain', viewId);
        event.dataTransfer.effectAllowed = 'move';

        // Dispatch drag start
        this.uiDispatch?.({ type: 'layout/dragStart', viewId });

        // Create a custom ghost element
        const target = event.currentTarget as HTMLElement;
        const ghost = target.cloneNode(true) as HTMLElement;
        
        // Style the ghost
        Object.assign(ghost.style, {
            position: 'absolute',
            top: '-1000px',
            left: '-1000px',
            width: '40px',
            height: '40px',
            background: '#1e293b',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '9999',
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        });

        // Ensure the icon inside is visible and sized
        const icon = ghost.querySelector('img');
        if (icon) {
            icon.style.width = '24px';
            icon.style.height = '24px';
        }

        document.body.appendChild(ghost);
        
        event.dataTransfer.setDragImage(ghost, 20, 20);
        
        setTimeout(() => {
            document.body.removeChild(ghost);
        }, 0);
    }

    private handleTokenDragEnd(event: DragEvent) {
        this.uiDispatch?.({ type: 'layout/dragEnd' });
    }

    private handleTokenDragOver(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
    }

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

        const targetToken = (event.target as HTMLElement).closest('.token');
        const targetViewId = targetToken?.getAttribute('data-view-id');

        const nextOrder: string[] = currentOrder.filter((id: string) => id !== viewId);

        if (targetViewId && targetViewId !== viewId) {
            const toIndex = nextOrder.indexOf(targetViewId);
            if (toIndex !== -1) {
                nextOrder.splice(toIndex, 0, viewId);
            } else {
                nextOrder.push(viewId);
            }
        } else {
            nextOrder.push(viewId);
        }

        this.viewHandlers.setMainViewOrder(nextOrder);
    }

    toggleSide(side: 'left' | 'right' | 'bottom') {
        const key = `expander${side.charAt(0).toUpperCase()}${side.slice(1)}` as keyof LayoutExpansion;
        const currentState = this.uiState?.layout?.expansion?.[key] ?? 'Closed';
        const newState = toggleExpanderState(currentState);
        this.expanderHandlers.setExpansion(side, newState);
    }

    toggleOverlay() {
        const currentOverlay = this.uiState?.layout?.overlayView;
        const nextOverlay = currentOverlay ? null : 'settings';
        this.expanderHandlers.setOverlayView(nextOverlay);
    }

    setZoom(level: number) {
        this.zoomLevel = level;
        this.dispatchEvent(new CustomEvent('zoom-change', {
            detail: { zoom: level },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        const isRow = this.orientation === 'row';
        const views = this.uiState?.viewDefinitions ?? [];
        const viewMap = new Map(views.map((view: ViewDefinitionSummary) => [view.id, view]));
        const activeOrder = this.resolveActiveMainViews();
        const activeSet = new Set(activeOrder);
        const capacity = this.panelLimit;
        const tokenOrder = this.resolveTokenViewOrder();

        const expansion = this.uiState?.layout?.expansion ?? {
            expanderLeft: 'Closed',
            expanderRight: 'Closed',
            expanderBottom: 'Closed'
        };
        const leftExpanded = isExpanderPanelOpen(expansion.expanderLeft);
        const rightExpanded = isExpanderPanelOpen(expansion.expanderRight);
        const bottomExpanded = isExpanderPanelOpen(expansion.expanderBottom);
        const overlayOpen = !!this.uiState?.layout?.overlayView;

        const toolbarClass = `workspace-toolbar ${isRow ? 'row' : 'column'}`;
        const expanderClass = `expander-section ${isRow ? '' : 'column'}`;
        const viewsClass = `views-section ${isRow ? 'row' : 'column'}`;
        const separatorClass = `separator ${isRow ? 'row' : 'column'}`;

        const zoomLevels = [1, 2, 3, 4, 5];

        return html`
            <div class="${toolbarClass}">
                <!-- Expander Controls -->
                <div class="${expanderClass}">
                    <button class="icon-button ${leftExpanded ? 'active' : ''}" @click=${() => this.toggleSide('left')} title="Toggle Left Panel">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <rect x="3" y="3" width="18" height="18" fill="#cbd5e1" stroke="none" />
                           <rect x="3" y="3" width="5" height="18" fill="#0284c7" stroke="none" />
                           ${leftExpanded
                             ? html`<path d="M12 12l-3 0m0 0l1.5 -1.5m-1.5 1.5l1.5 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
                             : html`<path d="M10 12l3 0m0 0l-1.5 -1.5m1.5 1.5l-1.5 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
                           }
                        </svg>
                    </button>
                    <button class="icon-button ${bottomExpanded ? 'active' : ''}" @click=${() => this.toggleSide('bottom')} title="Toggle Bottom Panel">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <rect x="3" y="3" width="18" height="18" fill="#cbd5e1" stroke="none" />
                           <rect x="3" y="18" width="18" height="3" fill="#0284c7" stroke="none" />
                           ${bottomExpanded
                             ? html`<path d="M12 12l0 3m0 0l-1.5 -1.5m1.5 1.5l1.5 -1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
                             : html`<path d="M12 15l0 -3m0 0l-1.5 1.5m1.5 -1.5l1.5 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
                           }
                        </svg>
                    </button>
                    <button class="icon-button ${rightExpanded ? 'active' : ''}" @click=${() => this.toggleSide('right')} title="Toggle Right Panel">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <rect x="3" y="3" width="18" height="18" fill="#cbd5e1" stroke="none" />
                           <rect x="16" y="3" width="5" height="18" fill="#0284c7" stroke="none" />
                           ${rightExpanded
                             ? html`<path d="M12 12l3 0m0 0l-1.5 -1.5m1.5 1.5l-1.5 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
                             : html`<path d="M14 12l-3 0m0 0l1.5 -1.5m-1.5 1.5l1.5 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
                           }
                        </svg>
                    </button>
                    <div class="${separatorClass}"></div>
                    <button class="icon-button ${overlayOpen ? 'active' : ''}" @click=${() => this.toggleOverlay()} title="Toggle Overlay">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>
                </div>

                <!-- View Controls -->
                <div class="${viewsClass}" @click=${this.viewHandlers.stopClickPropagation}>
                    <div class="slot-strip">
                        ${Array.from({ length: 5 }).map((_, index) => {
                            const viewId = activeOrder[index] ?? null;
                            const view = viewId ? views.find((item) => item.id === viewId) : null;
                            const isEnabled = index < capacity;
                            const slotClass = `slot ${isEnabled ? 'slot--active' : ''}`;

                            return html`
                                <button
                                    class="${slotClass}"
                                    @click=${() => this.handleSlotClick(index)}
                                    title="Slot ${index + 1}"
                                >
                                    <span class="slot__label">${index + 1}</span>
                                </button>
                            `;
                        })}
                    </div>

                    <div
                        class="token-pool"
                        @dragover=${this.handleTokenDragOver}
                        @drop=${(event: DragEvent) => this.handleDrop(event)}
                    >
                        ${tokenOrder
                            .map((viewId: string) => viewMap.get(viewId))
                            .filter((view?: ViewDefinitionSummary): view is ViewDefinitionSummary => !!view)
                            .map((view: ViewDefinitionSummary) => {
                                const label = this.getViewLabel(view);
                                const iconName = this.getViewIcon(view);
                                return html`
                                    <div
                                        class="token"
                                        data-view-id=${view.id}
                                        draggable="true"
                                        title=${label}
                                        @dragstart=${(event: DragEvent) => this.handleTokenDragStart(event, view.id)}
                                        @dragend=${this.handleTokenDragEnd}
                                    >
                                        <span class="token__icon">
                                            <img src="https://storage.googleapis.com/lozzuck.appspot.com/blox/icons/${iconName}.png" alt="${label}" />
                                        </span>
                                    </div>
                                `;
                            })}

                        <button
                            @click=${this.viewHandlers.resetSession}
                            class="icon-button"
                            title="New Session / Reset"
                        >
                            <i class="icon codicon codicon-refresh"></i>
                        </button>
                    </div>
                </div>

                <!-- Zoom Controls -->
                <div class="zoom-section">
                    ${zoomLevels.map(level => html`
                        <button
                            class="zoom-button ${this.zoomLevel === level ? 'active' : ''}"
                            @click=${() => this.setZoom(level)}
                            title="${level}x Zoom"
                        >
                            ${level}X
                        </button>
                    `)}
                </div>

                <!-- Scale Controls -->
                <div class="scale-section">
                    <button class="icon-button" title="Grid View">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                    </button>
                    <button class="icon-button" title="Layout Options">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }
}

customElements.define('workspace-controls', Workspace);
