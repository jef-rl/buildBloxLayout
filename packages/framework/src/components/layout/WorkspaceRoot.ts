// @ts-nocheck
import { LitElement, html, css, nothing } from 'lit';
import { ContextProvider } from '@lit/context';
import { uiStateContext } from '../../state/context';
import { uiState } from '../../state/ui-state';
import { DockManager } from './DockManager';
import '../controls/Toolbar';
import '../controls/Resizer';
import '../controls/Expander';
import './DockContainer';
import './OverlayLayer';
import './PanelView';
import { applyLayoutAction } from '../../handlers/workspace/layout';
import { viewRegistry } from '../../registry/ViewRegistry';
import { applyContextUpdate } from '../../utils/context-update';

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

    private panelState = {
        open: {},
        data: {},
        errors: {},
    };

    private unsubscribe: (() => void) | null = null;
    private registryUnsubscribe: (() => void) | null = null;

    private provider = new ContextProvider(this, {
        context: uiStateContext,
        initialValue: {
            state: this.getContextState(),
            dispatch: (payload: { type: string; [key: string]: unknown }) => this.dispatch(payload),
        },
    });

    connectedCallback() {
        super.connectedCallback();
        this.unsubscribe = uiState.subscribe((nextState) => {
            this.state = nextState;
            this.refreshContext();
        });
        this.registryUnsubscribe = viewRegistry.onRegistryChange(() => {
            this.requestUpdate();
        });
        this.refreshContext();
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

    private getContextState() {
        const snapshot = this.state ?? uiState.getState();
        const panels = Array.isArray(snapshot.panels) ? [...snapshot.panels] : { ...(snapshot.panels ?? {}) };

        if (panels && typeof panels === 'object') {
            panels.open = this.panelState.open;
            panels.data = this.panelState.data;
            panels.errors = this.panelState.errors;
        }

        return {
            ...snapshot,
            panels,
        };
    }

    private refreshContext() {
        this.provider.setValue({
            state: this.getContextState(),
            dispatch: (payload: { type: string; [key: string]: unknown }) => this.dispatch(payload),
        });
        this.requestUpdate();
    }

    private ensureLayoutState() {
        const layout = typeof this.state?.layout === 'object' && this.state.layout ? this.state.layout : {};
        this.state.layout = {
            ...layout,
            expansion: layout.expansion ?? { left: false, right: false, bottom: false },
            overlayView: layout.overlayView ?? null,
            viewportWidthMode: layout.viewportWidthMode ?? 'auto',
            mainAreaCount: layout.mainAreaCount ?? 1,
        };
    }

    private ensureAuthState() {
        const auth = typeof this.state?.auth === 'object' && this.state.auth ? this.state.auth : {};
        this.state.auth = {
            ...auth,
            isLoggedIn: auth.isLoggedIn ?? false,
            user: auth.user ?? null,
        };
    }

    private dispatch(payload: { type: string; [key: string]: unknown }) {
        this.ensureLayoutState();
        this.ensureAuthState();
        const handledLayout = applyLayoutAction(this.state, payload);

        if (!handledLayout) {
            switch (payload.type) {
                case 'context/update':
                    this.state = applyContextUpdate(this.state, {
                        path: payload.path as string | string[],
                        value: payload.value,
                    });
                    break;
                case 'panels/selectPanel':
                    if (payload.panelId) {
                        this.panelState.data = {
                            ...this.panelState.data,
                            targetPanelId: payload.panelId,
                        };
                    }
                    break;
                case 'panels/assignView': {
                    const viewId = payload.viewId as string | undefined;
                    const targetPanelId = payload.panelId ?? this.panelState.data?.targetPanelId;
                    const panels = this.state?.panels ?? [];
                    const fallbackPanel = panels.find((panel) => panel.region === 'main') ?? panels[0];
                    const panelId = targetPanelId ?? fallbackPanel?.id;
                    const panel = panels.find((item) => item.id === panelId);
                    if (panel && viewId) {
                        const view = viewRegistry.createView(viewId);
                        if (view) {
                            panel.view = view;
                            panel.viewId = viewId;
                            panel.activeViewId = viewId;
                            this.state.views = this.state.views.filter((existing) => existing.id !== view.id).concat(view);
                            this.state.activeView = view.id;
                        }
                    }
                    break;
                }
                case 'panels/togglePanel':
                    if (payload.panelId || payload.viewId) {
                        const panelId = payload.panelId ?? payload.viewId;
                        this.panelState.open[panelId] = !this.panelState.open[panelId];
                    }
                    break;
                case 'panels/setScopeMode':
                    this.panelState.data = {
                        ...this.panelState.data,
                        scope: { ...(this.panelState.data?.scope ?? {}), mode: payload.mode },
                    };
                    break;
                case 'session/reset':
                    this.panelState.errors = {};
                    this.panelState.data = {};
                    break;
                case 'auth/setUser': {
                    const nextUser = payload.user as { uid: string; email?: string } | null | undefined;
                    this.state.auth = {
                        ...this.state.auth,
                        user: nextUser ?? null,
                        isLoggedIn: Boolean(nextUser),
                    };
                    break;
                }
                default:
                    break;
            }
        }

        uiState.update(this.state);
    }

    private resolveViewId(view: any): string | null {
        return view?.component ?? view?.viewType ?? view?.id ?? null;
    }

    render() {
        const layout = this.state?.layout ?? {};
        const expansion = layout.expansion ?? { left: false, right: false, bottom: false };
        const panels = this.state?.panels ?? [];

        const viewportMode = layout.viewportWidthMode ?? 'auto';
        const viewportCount = viewportMode === 'auto' ? NaN : Number.parseInt(viewportMode, 10);

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

                <dock-container .manager=${this.dockManager} toolbarId="viewport" fallbackPosition="bottom-right">
                    <size-controls></size-controls>
                </dock-container>

                <dock-container .manager=${this.dockManager} toolbarId="expander" fallbackPosition="bottom-left">
                    <expander-controls></expander-controls>
                </dock-container>

                ${overlayView ? html`
                    <overlay-expander .viewId="${overlayView}"></overlay-expander>
                ` : nothing}
            </div>
        `;
    }
}

customElements.define('workspace-root', WorkspaceRoot);
