// @ts-nocheck
import { LitElement, html, css, nothing } from 'lit';
import { consume } from '@lit/context';
import type { CoreContext } from '../../runtime/context/core-context';
import { coreContext } from '../../runtime/context/core-context-key';
import { ActionCatalog, type ActionName } from '../../runtime/actions/action-catalog';
import type { UIState } from '../../../types/state';
import { DockManager } from '../../../domains/dock/components/DockManager.js';
import '../../../domains/layout/components/FrameworkMenu.js';
import '../../../domains/layout/components/ViewRegistryPanel.js';
import '../../../domains/dock/components/DockContainer.js';
import './OverlayLayer.js';
import './PanelOverlay.js';
import '../host/view-host.js';
import type { ViewInstanceResolver } from '../../selectors/view-instances/resolve-view-instance.selector';
import {
    viewInstanceResolverSelectorKey,
} from '../../selectors/view-instances/resolve-view-instance.selector';
import type { WorkspaceLayoutDerived } from '../../selectors/workspace/workspace-layout.selector';
import { workspaceLayoutSelectorKey } from '../../selectors/workspace/workspace-layout.selector';

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
            position: relative;
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

    @consume({ context: coreContext, subscribe: true })
    core?: CoreContext<UIState>;

    private dispatch(action: ActionName, payload?: Record<string, unknown>) {
        this.core?.dispatch({ action, payload });
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
            this.dispatch(ActionCatalog.PanelsAssignView, { viewId, panelId, placement });
        }
    }

    private renderSidePanelStack(
        region: 'left' | 'right' | 'bottom',
        viewOrder: string[],
        panelId: string,
        resolveViewInstance: ViewInstanceResolver | null,
        showDropZones: boolean,
    ) {
        const isEmpty = viewOrder.length === 0;
        if (!resolveViewInstance) {
            return nothing;
        }

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
                
                ${viewOrder.map((viewId) => {
                    const instance = resolveViewInstance(viewId);
                    return instance
                        ? html`
                            <div class="stack-item">
                                <view-host .instances=${[instance]}></view-host>
                            </div>
                        `
                        : nothing;
                })}
                
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

    private renderSash(expansion: UIState['layout']['expansion'] | null | undefined, side: 'left' | 'right' | 'bottom') {
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
                @click=${() => this.dispatch(ActionCatalog.LayoutSetExpansion, { side, state: newState })}
                title="${isClosed ? 'Open' : 'Close'} ${side} panel"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="${iconPath}" />
                </svg>
            </button>
        `;
    }

    render() {
        const workspaceLayout = this.core?.select<WorkspaceLayoutDerived>(workspaceLayoutSelectorKey);
        const resolveViewInstance = this.core?.select<ViewInstanceResolver>(viewInstanceResolverSelectorKey) ?? null;
        if (!workspaceLayout) {
            return html``;
        }

        const {
            expansion,
            leftOpen,
            rightOpen,
            bottomOpen,
            leftWidth,
            rightWidth,
            bottomHeight,
            mainPanelEntries,
            mainPanelWidth,
            leftPanel,
            rightPanel,
            bottomPanel,
            leftViewOrder,
            rightViewOrder,
            bottomViewOrder,
            showDropZones,
        } = workspaceLayout;

        return html`
            <div class="workspace">
                <div
                    class="layout"
                    style="
                        --left-width: ${leftWidth};
                        --right-width: ${rightWidth};
                        --bottom-height: ${bottomHeight};
                        --main-panel-count: ${Math.max(mainPanelEntries.length, 1)};
                        --main-panel-width: ${mainPanelWidth};
                    "
                >
                    <div class="expander expander-left ${leftOpen ? '' : 'collapsed'}">
                            ${this.renderSash(expansion, 'left')}
            
                        ${leftPanel ? this.renderSidePanelStack('left', leftViewOrder, leftPanel.id, resolveViewInstance, showDropZones) : nothing}
                    </div>

                    <div class="main-area">
                        ${mainPanelEntries.map(({ panel }) => html`
                            <div
                                class="main-panel"
                                @click=${() => panel && this.dispatch(ActionCatalog.PanelsSelectPanel, { panelId: panel.id })}
                            >
                                ${panel
                                    ? html`
                                        <view-host .panelId=${panel.id}></view-host>
                                        <panel-overlay .panelId=${panel.id}></panel-overlay>
                                    `
                                    : nothing}
                            </div>
                        `)}
                    </div>

                    <div class="expander expander-right ${rightOpen ? '' : 'collapsed'}">
                    ${this.renderSash(expansion, 'right')}
                        ${rightPanel ? this.renderSidePanelStack('right', rightViewOrder, rightPanel.id, resolveViewInstance, showDropZones) : nothing}
                    </div>

                    <div class="expander expander-bottom ${bottomOpen ? '' : 'collapsed'}">
                    ${this.renderSash(expansion, 'bottom')}
                    ${bottomPanel ? this.renderSidePanelStack('bottom', bottomViewOrder, bottomPanel.id, resolveViewInstance, showDropZones) : nothing}
                    </div>

                </div>

                <dock-container .manager=${this.dockManager} toolbarId="burger" fallbackPosition="top-left" disablePositionPicker>
                    <framework-menu></framework-menu>
                </dock-container>

                <dock-container .manager=${this.dockManager} toolbarId="registry" fallbackPosition="bottom-right">
                    <view-registry-panel></view-registry-panel>
                </dock-container>

                <dock-container .manager=${this.dockManager} toolbarId="control" fallbackPosition="top-center" disablePositionPicker>
                    <embed-view viewId="main-toolbar-1" class="workspace-toolbar"></embed-view>
                </dock-container>


                <overlay-expander></overlay-expander>
            </div>
        `;
    }
}

customElements.define('workspace-root', WorkspaceRoot);
