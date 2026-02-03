// @ts-nocheck
import { LitElement, html, css, nothing } from 'lit';
import { uiState } from '../../../state/ui-state.js';
import { DockManager } from '../../dock/components/DockManager.js';
// import '../../layout/components/PresetManager.js';
import '../../layout/components/FrameworkMenu.js';
import '../../layout/components/ViewRegistryPanel.js';
import '../../dock/components/DockContainer.js';
import './OverlayLayer.js';
import './PanelView.js';
import { viewRegistry } from '../../../core/registry/view-registry.js';
import { dispatchUiEvent } from '../../../utils/dispatcher.js';
import { isExpanderPanelOpen } from '../../../utils/expansion-helpers.js';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export class WorkspaceRoot extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
            z-index:50;
            background-color: #0f172a;
        }

        .workspace {
            position: relative;
            width: 100%;
            height: 100%;
        }

        .layout {
            position: relative;
            display: grid;
            grid-template-columns: var(--left-width) minmax(0, 1fr) var(--right-width);
            grid-template-rows: minmax(0, 1fr) var(--bottom-height);
            width: 100%;
            height: 100%;
            transition: grid-template-columns 0.2s ease, grid-template-rows 0.2s ease;
        }

        .expander {
            position: relative;
            background-color: #111827;
            border: 1px solid #1f2937;
            overflow: visible;
            transition: opacity 0.2s ease;
            display: flex;
            flex-direction: column;
        }

        .expander.collapsed {
            opacity: 1;
            border-width: 0;
        }

        .expander-left {
            grid-column: 1;
            grid-row: 1 / span 2;
        }

        .expander-right {
            grid-column: 3;
            grid-row: 1 / span 2;
        }

        .expander-bottom {
            grid-column: 2;
            grid-row: 2;
            border-top: none;
        }

        .main-area {
            grid-column: 2;
            grid-row: 1;
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: var(--main-panel-width);
            grid-template-columns: repeat(auto-fit, var(--main-panel-width));
            height: 100%;
            min-width: 0;
            width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            background-color: #0b1220;
            z-inddex:0;
        }

        .main-panel {
            min-height: 0;
            min-width: 0;
            border-left: 1px solid #1f2937;
        }

        .main-panel:first-child {
            border-left: none;
        }

        /* Stack Styles */
        .side-panel-stack {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            overflow-y: auto;
        }

        .stack-item {
            flex: 0 0 auto;
            min-height: 200px;
            border-bottom: 1px solid #1f2937;
            position: relative;
        }

        .drop-zone {
            height: 10px;
            flex-shrink: 0;
            transition: all 0.2s ease;
            background: transparent;
        }

        .drop-zone:hover, .drop-zone.drag-over {
            height: 40px;
            background: rgba(59, 130, 246, 0.1);
            border: 2px dashed #3b82f6;
        }
        
        .drop-zone.top {
            border-bottom: none;
        }
        
        .drop-zone.bottom {
            border-top: none;
            flex-grow: 1; /* Allow bottom drop zone to fill remaining space */
            min-height: 20px;
        }
        
        .drop-zone.hidden {
            height: 0;
            max-height: 0;
            border: none;
            overflow: hidden;
            padding: 0;
            margin: 0;
        }

        /* Sash Toggles */
        .sash-toggle {
            position: absolute;
            z-index: 999; /* Above panels */
            background-color: #1e293b;
            border: 1px solid #334155;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            color: #94a3b8;
            padding: 0;
        }

        .sash-toggle:hover {
            background-color: #334155;
            color: white;
        }

        .sash-toggle.left {
            left: var(--left-width, 0px);
            top: 120px; /* Y offset */
            width: 24px;
            height: 32px;
            border-left: none;
            border-radius: 0 4px 4px 0;
            transition: left 0.2s ease;
        }

        .sash-toggle.right {
            right: var(--right-width, 0px);
            top: 120px; /* Y offset */
            width: 24px;
            height: 32px;
            border-right: none;
            border-radius: 4px 0 0 4px;
            transition: right 0.2s ease;
        }

        .sash-toggle.bottom {
            bottom: var(--bottom-height, 0px);
            left: 120px; /* X offset */
            width: 32px;
            height: 24px;
            border-bottom: none;
            border-radius: 4px 4px 0 0;
            transition: bottom 0.2s ease;
        }
    `;

    private dockManager = new DockManager();

    private state = uiState.getState();

    private unsubscribe: (() => void) | null = null;
    private registryUnsubscribe: (() => void) | null = null;

    connectedCallback() {
        super.connectedCallback();
        this.unsubscribe = uiState.subscribe((nextState) => {
            this.state = nextState;
            this.requestUpdate();
        });
        this.registryUnsubscribe = viewRegistry.onRegistryChange(() => {
            this.requestUpdate();
        });
        this.requestUpdate();
    }

    disconnectedCallback() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        if (this.registryUnsubscribe) {
            this.registryUnsubscribe();
            this.registryUnsubscribe = null;
        }
        super.disconnectedCallback();
    }

    private dispatch(payload: { type: string; [key: string]: unknown }) {
        dispatchUiEvent(this, payload.type, payload);
    }

    private resolveViewId(view: any): string | null {
        return view?.component ?? view?.viewType ?? view?.id ?? null;
    }

    private handleDragOver(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
        }
        (e.target as HTMLElement).classList.add('drag-over');
    }

    private handleDragLeave(e: DragEvent) {
        (e.target as HTMLElement).classList.remove('drag-over');
    }

    private handleDrop(e: DragEvent, region: string, panelId: string, placement: 'top' | 'bottom') {
        e.preventDefault();
        e.stopPropagation();
        (e.target as HTMLElement).classList.remove('drag-over');

        const viewId = e.dataTransfer?.getData('application/x-view-id');
        if (viewId) {
            this.dispatch({ 
                type: 'panels/assignView', 
                viewId, 
                panelId,
                placement
            });
        }
    }

    private renderSidePanelStack(region: 'left' | 'right' | 'bottom', viewOrder: string[], panelId: string) {
        const inDesign = this.state?.layout?.inDesign;
        const isAdmin = this.state?.auth?.isAdmin;
        const showDropZones = inDesign && isAdmin;
        const isEmpty = viewOrder.length === 0;

        return html`
            <div class="side-panel-stack">
                ${showDropZones ? html`
                <div 
                    class="drop-zone top"
                    @dragover=${this.handleDragOver}
                    @dragleave=${this.handleDragLeave}
                    @drop=${(e: DragEvent) => this.handleDrop(e, region, panelId, 'top')}
                    title="Drop to add to top"
                ></div>
                ` : nothing}
                
                ${viewOrder.map(viewId => html`
                    <div class="stack-item">
                        <panel-view .panelId="${panelId}" .viewId="${viewId}"></panel-view>
                    </div>
                `)}
                
                ${showDropZones ? html`
                <div 
                    class="drop-zone bottom"
                    @dragover=${this.handleDragOver}
                    @dragleave=${this.handleDragLeave}
                    @drop=${(e: DragEvent) => this.handleDrop(e, region, panelId, 'bottom')}
                    title="Drop to add to bottom"
                    style="${isEmpty ? 'height: 100%;' : ''}"
                ></div>
                ` : nothing}
            </div>
        `;
    }

    private renderSash(side: 'left' | 'right' | 'bottom') {
        const expansion = this.state?.layout?.expansion;
        const key = `expander${side.charAt(0).toUpperCase()}${side.slice(1)}` as keyof typeof expansion;
        const state = expansion?.[key] ?? 'Closed';

        // Only show if Closed or Opened
        if (state !== 'Closed' && state !== 'Opened') {
            return nothing;
        }

        const isClosed = state === 'Closed';
        const newState = isClosed ? 'Opened' : 'Closed';
        
        let iconPath = '';
        if (side === 'left') {
            iconPath = isClosed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7";
        } else if (side === 'right') {
            iconPath = isClosed ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7";
        } else {
            iconPath = isClosed ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7";
        }

        return html`
            <button 
                class="sash-toggle ${side}" 
                @click=${() => this.dispatch({ type: 'layout/setExpansion', side, state: newState })}
                title="${isClosed ? 'Open' : 'Close'} ${side} panel"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="${iconPath}" />
                </svg>
            </button>
        `;
    }

    render() {
        const layout = this.state?.layout ?? {};
        const expansion = layout.expansion ?? {
            expanderLeft: 'Closed',
            expanderRight: 'Closed',
            expanderBottom: 'Closed'
        };
        const panels = this.state?.panels ?? [];

        const viewportMode = layout.viewportWidthMode ?? '1x';
        const viewportCount = Number.parseInt(viewportMode, 10);
        const viewportWidthMap: Record<string, string> = {
            '1x': '100%',
            '2x': '50%',
            '3x': '33.333%',
            '4x': '25%',
            '5x': '20%',
        };

        const leftOpen = isExpanderPanelOpen(expansion.expanderLeft);
        const rightOpen = isExpanderPanelOpen(expansion.expanderRight);
        const bottomOpen = isExpanderPanelOpen(expansion.expanderBottom);

        const leftWidth = leftOpen ? 'clamp(220px, 22vw, 360px)' : '0px';
        const rightWidth = rightOpen ? 'clamp(220px, 22vw, 360px)' : '0px';
        const bottomHeight = bottomOpen ? 'clamp(180px, 26vh, 320px)' : '0px';

        const overlayView = layout.overlayView ?? null;
        const mainPanels = panels.filter((panel) => panel.region === 'main');
        const totalMainPanels = mainPanels.length;
        const mainPanelWidth = viewportWidthMap[viewportMode] ?? `${100 / clamp(Number.isFinite(viewportCount) ? viewportCount : (totalMainPanels || 1), 1, 5)}%`;
        const leftPanel = panels.find((panel) => panel.region === 'left');
        const rightPanel = panels.find((panel) => panel.region === 'right');
        const bottomPanel = panels.find((panel) => panel.region === 'bottom');
        const mainPanelsToRender = mainPanels;
        const getPanelViewId = (panel: { activeViewId?: string; viewId?: string; view?: unknown } | null) =>
            panel?.activeViewId ?? panel?.viewId ?? this.resolveViewId(panel?.view);
        const getPanelViewInstanceId = (panel: { view?: { id?: string } | null } | null) =>
            panel?.view?.id ?? null;

        const leftViewOrder = layout.leftViewOrder || (leftPanel?.viewId ? [leftPanel.viewId] : []);
        const rightViewOrder = layout.rightViewOrder || (rightPanel?.viewId ? [rightPanel.viewId] : []);
        const bottomViewOrder = layout.bottomViewOrder || (bottomPanel?.viewId ? [bottomPanel.viewId] : []);

        return html`
            <div class="workspace">
                <div
                    class="layout"
                    style="
                        --left-width: ${leftWidth};
                        --right-width: ${rightWidth};
                        --bottom-height: ${bottomHeight};
                        --main-panel-count: ${Math.max(mainPanelsToRender.length, 1)};
                        --main-panel-width: ${mainPanelWidth};
                    "
                >
                    <div class="expander expander-left ${leftOpen ? '' : 'collapsed'}">
                            ${this.renderSash('left')}
            
                        ${leftPanel ? this.renderSidePanelStack('left', leftViewOrder, leftPanel.id) : nothing}
                    </div>

                    <div class="main-area">
                        ${mainPanelsToRender.map((panel) => html`
                            <div
                                class="main-panel"
                                @click=${() => panel && this.dispatch({ type: 'panels/selectPanel', panelId: panel.id })}
                            >
                                <panel-view
                                    .panelId="${panel.id}"
                                    .viewId="${getPanelViewId(panel)}"
                                    .viewInstanceId="${getPanelViewInstanceId(panel)}"
                                ></panel-view>
                            </div>
                        `)}
                    </div>

                    <div class="expander expander-right ${rightOpen ? '' : 'collapsed'}">
                    ${this.renderSash('right')}
                        ${rightPanel ? this.renderSidePanelStack('right', rightViewOrder, rightPanel.id) : nothing}
                    </div>

                    <div class="expander expander-bottom ${bottomOpen ? '' : 'collapsed'}">
                    ${this.renderSash('bottom')}
                    ${bottomPanel ? this.renderSidePanelStack('bottom', bottomViewOrder, bottomPanel.id) : nothing}
                    </div>

                </div>

                <dock-container .manager=${this.dockManager} toolbarId="burger" fallbackPosition="top-left" disablePositionPicker>
                    <framework-menu></framework-menu>
                </dock-container>

                <dock-container .manager=${this.dockManager} toolbarId="registry" fallbackPosition="bottom-right">
                    <view-registry-panel></view-registry-panel>
                </dock-container>

                <dock-container .manager=${this.dockManager} toolbarId="control" fallbackPosition="top-center" disablePositionPicker>
                    <toolbar-view viewId="main-toolbar-1" class="workspace-toolbar"></toolbar-view>
                </dock-container>


                ${overlayView ? html`
                    <overlay-expander .viewId="${overlayView}"></overlay-expander>
                ` : nothing}
            </div>
        `;
    }
}

customElements.define('workspace-root', WorkspaceRoot);



                // <dock-container .manager=${this.dockManager} toolbarId="presets" fallbackPosition="top-right">
                //     <preset-manager></preset-manager>
                // </dock-container>
