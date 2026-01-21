// @ts-nocheck
import { LitElement, html, css, nothing } from 'lit';
import { uiState } from '../../../state/ui-state.js';
import { DockManager } from '../../dock/components/DockManager.js';
import '../../layout/components/ControlToolbar.js';
import '../../layout/components/PresetManager.js';
import '../../dock/components/DockContainer.js';
import './OverlayLayer.js';
import './PanelView.js';
import { viewRegistry } from '../../../core/registry/view-registry.js';
import { dispatchUiEvent } from '../../../utils/dispatcher.js';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export class WorkspaceRoot extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
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
            overflow: hidden;
            transition: opacity 0.2s ease;
        }

        .expander.collapsed {
            opacity: 0;
            pointer-events: none;
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
            grid-template-columns: repeat(var(--main-panel-count), var(--main-panel-width));
            height: 100%;
            min-width: 100%;
            width: max-content;
            overflow-x: auto;
            overflow-y: hidden;
            background-color: #0b1220;
        }

        .main-panel {
            min-height: 0;
            min-width: 0;
            border-left: 1px solid #1f2937;
        }

        .main-panel:first-child {
            border-left: none;
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

    render() {
        const layout = this.state?.layout ?? {};
        const expansion = layout.expansion ?? { left: false, right: false, bottom: false };
        const panels = this.state?.panels ?? [];

        const viewportMode = layout.viewportWidthMode ?? '1x';
        const viewportCount = Number.parseInt(viewportMode, 10);

        const leftWidth = expansion.left ? 'clamp(220px, 22vw, 360px)' : '0px';
        const rightWidth = expansion.right ? 'clamp(220px, 22vw, 360px)' : '0px';
        const bottomHeight = expansion.bottom ? 'clamp(180px, 26vh, 320px)' : '0px';

        const overlayView = layout.overlayView ?? null;
        const mainPanels = panels.filter((panel) => panel.region === 'main');
        const totalMainPanels = mainPanels.length;
        const fallbackCount = totalMainPanels || clamp(Number(layout.mainAreaCount ?? 1), 1, 5);
        const visibleCount = clamp(
            Number.isFinite(viewportCount) ? viewportCount : fallbackCount,
            1,
            5,
        );
        const leftPanel = panels.find((panel) => panel.region === 'left');
        const rightPanel = panels.find((panel) => panel.region === 'right');
        const bottomPanel = panels.find((panel) => panel.region === 'bottom');
        const mainPanelsToRender = mainPanels;
        const getPanelViewId = (panel: { activeViewId?: string; viewId?: string; view?: unknown } | null) =>
            panel?.activeViewId ?? panel?.viewId ?? this.resolveViewId(panel?.view);

        return html`
            <div class="workspace">
                <div
                    class="layout"
                    style="
                        --left-width: ${leftWidth};
                        --right-width: ${rightWidth};
                        --bottom-height: ${bottomHeight};
                        --main-panel-count: ${Math.max(mainPanelsToRender.length, 1)};
                        --main-panel-width: calc(100% / ${visibleCount});
                    "
                >
                    <div
                        class="expander expander-left ${expansion.left ? '' : 'collapsed'}"
                        @click=${() => leftPanel && this.dispatch({ type: 'panels/selectPanel', panelId: leftPanel.id })}
                    >
                        <panel-view .viewId="${getPanelViewId(leftPanel)}"></panel-view>
                    </div>

                    <div class="main-area">
                        ${mainPanelsToRender.map((panel) => html`
                            <div
                                class="main-panel"
                                @click=${() => panel && this.dispatch({ type: 'panels/selectPanel', panelId: panel.id })}
                            >
                                <panel-view .viewId="${getPanelViewId(panel)}"></panel-view>
                            </div>
                        `)}
                    </div>

                    <div
                        class="expander expander-right ${expansion.right ? '' : 'collapsed'}"
                        @click=${() => rightPanel && this.dispatch({ type: 'panels/selectPanel', panelId: rightPanel.id })}
                    >
                        <panel-view .viewId="${getPanelViewId(rightPanel)}"></panel-view>
                    </div>

                    <div
                        class="expander expander-bottom ${expansion.bottom ? '' : 'collapsed'}"
                        @click=${() => bottomPanel && this.dispatch({ type: 'panels/selectPanel', panelId: bottomPanel.id })}
                    >
                        <panel-view .viewId="${getPanelViewId(bottomPanel)}"></panel-view>
                    </div>
                </div>

                <dock-container .manager=${this.dockManager} toolbarId="views">
                    <view-controls></view-controls>
                </dock-container>

                <dock-container .manager=${this.dockManager} toolbarId="control" fallbackPosition="top-center">
                    <control-toolbar></control-toolbar>
                </dock-container>

                <dock-container .manager=${this.dockManager} toolbarId="presets" fallbackPosition="top-right">
                    <preset-manager></preset-manager>
                </dock-container>

                ${overlayView ? html`
                    <overlay-expander .viewId="${overlayView}"></overlay-expander>
                ` : nothing}
            </div>
        `;
    }
}

customElements.define('workspace-root', WorkspaceRoot);
