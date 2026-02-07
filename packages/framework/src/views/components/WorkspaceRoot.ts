// @ts-nocheck
import { LitElement, html, nothing } from 'lit';
import { consume } from '@lit/context';
import type { CoreContext } from '../../runtime/context/core-context';
import { coreContext } from '../../runtime/context/core-context-key';
import { ActionCatalog, type ActionName } from '../../runtime/actions/action-catalog';
import type { UIState } from '../../types/state';
import { DockManager } from './DockManager.js';
import './Menu.js';
import './ViewRegistryPanel.js';
import './DockContainer.js';
import './OverlayLayer.js';
import './ViewOverlay.js';
import '../host/view-host.js';
import type { ViewInstanceResolver } from '../../selectors/view-instances/resolve-view-instance.selector';
import {
    viewInstanceResolverSelectorKey,
} from '../../selectors/view-instances/resolve-view-instance.selector';
import type { WorkspaceLayoutDerived } from '../../selectors/workspace/workspace-layout.selector';
import { workspaceLayoutSelectorKey } from '../../selectors/workspace/workspace-layout.selector';
import { workspaceRootStyles } from './WorkspaceRoot.styles';

export class WorkspaceRoot extends LitElement {
    static styles = [workspaceRootStyles];

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
        isDesignActive: boolean,
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
                                <div class="panel-shell ${isDesignActive ? 'design-active' : ''}">
                                    <div class="panel-content" ?inert=${isDesignActive}>
                                        <view-host .instances=${[instance]}></view-host>
                                    </div>
                                    ${isDesignActive
                                        ? html`<view-overlay class="view-overlay" .panelId=${panelId}></view-overlay>`
                                        : nothing}
                                </div>
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
        const state = this.core?.getState();
        const isDesignActive = Boolean(state?.layout?.inDesign && state?.auth?.isAdmin);
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
            
                        ${leftPanel ? this.renderSidePanelStack('left', leftViewOrder, leftPanel.id, resolveViewInstance, showDropZones, isDesignActive) : nothing}
                    </div>

                    <div class="main-area">
                        ${mainPanelEntries.map(({ panel }) => html`
                            <div
                                class="main-panel"
                                @click=${() => panel && this.dispatch(ActionCatalog.PanelsSelectPanel, { panelId: panel.id })}
                            >
                                ${panel
                                    ? html`
                                        <div class="panel-shell ${isDesignActive ? 'design-active' : ''}">
                                            <div class="panel-content" ?inert=${isDesignActive}>
                                                <view-host .panelId=${panel.id}></view-host>
                                            </div>
                                            ${isDesignActive
                                                ? html`<view-overlay class="view-overlay" .panelId=${panel.id}></view-overlay>`
                                                : nothing}
                                        </div>
                                    `
                                    : nothing}
                            </div>
                        `)}
                    </div>

                    <div class="expander expander-right ${rightOpen ? '' : 'collapsed'}">
                    ${this.renderSash(expansion, 'right')}
                        ${rightPanel ? this.renderSidePanelStack('right', rightViewOrder, rightPanel.id, resolveViewInstance, showDropZones, isDesignActive) : nothing}
                    </div>

                    <div class="expander expander-bottom ${bottomOpen ? '' : 'collapsed'}">
                    ${this.renderSash(expansion, 'bottom')}
                    ${bottomPanel ? this.renderSidePanelStack('bottom', bottomViewOrder, bottomPanel.id, resolveViewInstance, showDropZones, isDesignActive) : nothing}
                    </div>

                </div>

                <dock-container .manager=${this.dockManager} toolbarId="burger" fallbackPosition="top-left" disablePositionPicker>
                    <menu-view></menu-view>
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
