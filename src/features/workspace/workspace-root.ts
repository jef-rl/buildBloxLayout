// @ts-nocheck
import { LitElement, html, css, nothing } from 'lit';

// Services
import { ProjectsApi } from '../../core/services/projects-api';
import { GeminiClient } from '../../core/services/gemini';
import { listLocalProjects } from '../../core/services/local-projects';
import { createViewsRegistry } from '../../core/registry/views';
import '../../core/registry/handlers';

// Components
import './main-menu';
import '../../shared/layout/views/view-controls';
import '../../shared/layout/views/size-controls';
import '../../shared/layout/views/expander-controls';
import '../../shared/layout/views/overlay-expander';
import '../panels/panel-scope';
import '../panels/panel-editor';
import '../panels/panel-preview';
import '../panels/panel-export';
import '../panels/panel-view';
import '../panels/panel-visual-block';
import '../../shared/layout/core/dock-container';
import '../projects/project-save-modal';
import '../projects/project-library-modal';
import '../projects/paste-modal';
import '../ai/ai-prompt-modal';
import '../ai/settings-modal';
import { DockManager } from '../../shared/layout/core/dock-manager';
import { createInitialUiState, INITIAL_JSON_INPUT } from '../../core/state/ui-state.js';
import { getPosClasses } from '../../core/utils/ui-helpers.js';
import {
    buildAiInstructionMap,
    createWorkspaceUiEventHandlers,
    createWorkspaceViewHandlers,
    createPanelHandlers,
    selectComputedLayoutWidth,
    selectGeneratedCode,
} from '../../handlers/workspace';
import { createGeminiHandlers } from '../../handlers/ai';
import { createProjectHandlers } from '../../handlers/projects';
import { createUiContextHandlers } from '../../handlers/state';
import type { HandlerMessage } from '../../core/types/index.js';

class AppRoot extends LitElement {
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            height: 100vh;
            width: 100vw;
            overflow: hidden;
            background-color: #030712; /* gray-950 */
        }

        .workspace {
            display: grid;
            grid-template-rows: 1fr auto; /* Main content (flexible) + Bottom Panel (auto/fixed) */
            grid-template-columns: auto 1fr auto; /* Left Panel + Main + Right Panel */
            width: 100vw;
            height: 100%;
            position: relative;
            overflow: hidden;
        }

        .side-panel {
            grid-row: 1 / 3; /* Occupy both rows so bottom panel is between them */
            width: 0;
            overflow: hidden;
            transition: width 0.3s ease;
            background-color: #111827;
            border-right: 1px solid #374151;
            z-index: 40;
        }

        .side-panel.left-panel {
            grid-column: 1 / 2;
        }

        .side-panel.right-panel {
            grid-column: 3 / 4;
            border-right: none;
            border-left: 1px solid #374151;
        }

        .side-panel.open {
            width: 25vw;
        }

        main {
            grid-row: 1 / 2; /* Occupy top row */
            grid-column: 2 / 3; /* Middle column */
            display: grid;
            overflow: auto hidden;
            height: 100%;
            width: 100%; /* Take remaining space in grid column */
            position: relative;
        }
            
        .layout-container {
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: var(--panel-width, 100%); 
            grid-template-rows: 1fr;
            height: 100%;
            transition: all 0.3s ease;
            width: auto;
            min-width: 100%;
        }

        /* Bottom Panel */
        .bottom-panel {
            grid-row: 2 / 3; /* Bottom row */
            grid-column: 2 / 3; /* Middle column only - between side panels */
            height: 0;
            background-color: #111827;
            border-top: 1px solid #374151;
            z-index: 45; 
            overflow: hidden;
            transition: height 0.3s ease;
        }

        .bottom-panel.open {
            height: 30vh;
        }

        .panel-host {
            display: flex;
            height: 100%;
            width: 100%;
            overflow: hidden; 
            min-width: 0; 
        }

        .file-input {
            display: none;
        }
    `;

    static properties = {
        panelRegistry: { type: Object },
        dockManager: { type: Object },
    };

    constructor() {
        super();
        this.api = new ProjectsApi();
        this.gemini = new GeminiClient();

        this.panelRegistry = this.buildViewRegistry();

        const aiSystemInstructions = this.buildAiInstructionMap();
        const initialState = createInitialUiState({
            systemInstructions: aiSystemInstructions,
            savedProjects: listLocalProjects(),
            dockLayouts: { 
                views: 'bottom-center', 
                size: 'bottom-right', 
                expanders: 'top-center' 
            },
        });

        this.stateHandlers = createUiContextHandlers(this, initialState, {
            onStateChange: (next) => {
                this.syncDockManagerFromLayout(next?.layout?.dockLayouts);
                this.requestUpdate();
            },
        });
        this.uiProvider = this.stateHandlers.provider;

        this.panelHandlers = createPanelHandlers({
            getState: () => this.uiState,
            dispatch: (action) => this.dispatch(action),
            requestRender: () => this.requestUpdate(),
            panelRegistry: this.panelRegistry,
        });

        this.aiHandlers = createGeminiHandlers({
            getState: () => this.uiState,
            dispatch: (action) => this.dispatch(action),
            applyAction: (action) => this.applyAction(action),
            gemini: this.gemini,
            panelRegistry: this.panelRegistry,
            isPanelEnabled: (panelId) => this.panelHandlers.isPanelEnabled(panelId),
        });

        this.projectHandlers = createProjectHandlers({
            getState: () => this.uiState,
            dispatch: (action) => this.dispatch(action),
            api: this.api,
            aiHandlers: this.aiHandlers,
            panelHandlers: this.panelHandlers,
            viewRegistry: this.panelRegistry,
        });

        this.workspaceUiHandlers = createWorkspaceUiEventHandlers({
            panelHandlers: this.panelHandlers,
            projectHandlers: this.projectHandlers,
            stateHandlers: this.stateHandlers,
        });

        this.viewHandlers = createWorkspaceViewHandlers({
            dispatch: (action) => this.dispatch(action),
        });

        this.panelHandlers.handleJsonChange(this.jsonInput);
        this.panelHandlers.handleJsonChange(INITIAL_JSON_INPUT);

        this.dockManager = new DockManager(initialState.layout?.dockLayouts, 'bottom-center');
        this.dockManager.addEventListener('change', () => this.requestUpdate());
        this.syncDockManagerFromLayout(initialState.layout?.dockLayouts);
        this.stateHandlers.registerInterceptor((action) => this.aiHandlers?.handleDispatch({ type: action.type, payload: action }) ?? false);
    }

    get uiState() { return this.stateHandlers.getState(); }
    get uiDispatch() { return this.stateHandlers.dispatch; }
    get panelData() { return this.uiState.panels.data; }
    get panelOpenStates() { return this.uiState.panels.open; }
    get viewState() { return this.uiState.view; }
    get aiState() { return this.uiState.ai; }
    get layoutState() { return this.uiState.layout; }
    get projectState() { return this.uiState.project; }
    get aiSystemInstructions() { return this.aiState.systemInstructions; }

    dispatch = (action) => {
        this.stateHandlers.dispatch(action);
    };

    applyAction(action) {
        this.stateHandlers.applyAction(action);
    }

    buildAiInstructionMap() {
        return buildAiInstructionMap(this.panelRegistry);
    }

    buildViewRegistry() {
        return createViewsRegistry({
            getPanelData: (panelId) => this.getPanelData(panelId),
            getPanelOpen: (panelId) => this.getPanelOpen(panelId),
            getComputedLayoutWidth: () => this.computedLayoutWidth,
            getTemplateInput: () => this.templateInput,
            getStylesInput: () => this.stylesInput,
            getRenderedHtml: () => this.renderedHtml,
            getRenderError: () => this.renderError,
            getGeneratedCode: () => this.generatedCode,
            getViewState: () => this.viewState,
            openView: (viewId, config) => this.viewHandlers.openView(viewId, config),
            closeView: () => this.viewHandlers.closeView(),
            isViewCloseDisabled: (viewId, options) => this.isViewCloseDisabled(viewId, options),
            panelHandlers: () => this.panelHandlers,
            aiHandlers: () => this.aiHandlers,
            copyExportCode: () => this.copyExportCode(),
            viewRenderers: () => ({
                renderAiPromptView: () => this.aiHandlers?.renderAiPromptView?.(),
                renderSettingsView: () => this.aiHandlers?.renderSettingsView?.(),
                renderProjectSaveView: (close) => this.projectHandlers?.renderSaveView?.(close),
                renderProjectLibraryView: (openView, closeView) =>
                    this.projectHandlers?.renderLibraryView?.(openView, closeView),
                renderProjectPasteView: () => this.projectHandlers?.renderPasteView?.(),
            }),
        });
    }

    getPanelEntry(panel) {
        return this.panelRegistry.find(p => p.id === panel);
    }

    getPanelData(panelId) {
        return this.panelData[panelId] || {};
    }

    isPanelEnabled(panelId) {
        return this.panelHandlers.isPanelEnabled(panelId);
    }

    getPanelOpen(panelId) {
        return this.panelHandlers.getPanelOpen(panelId);
    }

    setPanelOpen(panelId, open) {
        this.panelHandlers.setPanelOpen(panelId, open);
    }

    togglePanel(panelId) { this.panelHandlers.togglePanel(panelId); }

    get jsonInput() { return this.getPanelData('scope').jsonInput || ''; }
    get parsedScope() { return this.getPanelData('scope').parsedScope || {}; }
    get jsonError() { return this.getPanelData('scope').jsonError || ''; }
    get templateInput() { return this.getPanelData('template').templateInput || ''; }
    get stylesInput() { return this.getPanelData('styles').stylesInput || ''; }
    get renderedHtml() { return this.getPanelData('preview').renderedHtml || ''; }
    get renderError() { return this.getPanelData('preview').renderError || ''; }

    get computedLayoutWidth() {
        return selectComputedLayoutWidth(this.uiState, this.panelRegistry);
    }

    get generatedCode() {
        return selectGeneratedCode(this.uiState);
    }

    copyExportCode() {
        const text = this.generatedCode;
        navigator.clipboard.writeText(text).then(() => alert('Copied!'));
    }

    handleFileLoad = (e) => {
        this.projectHandlers.handleFileLoad(e);
    };

    getDockLayout(toolbar, fallback) {
        const position = this.layoutState?.dockLayouts?.[toolbar] || fallback;
        return { position, ...getPosClasses(position || fallback) };
    }

    renderPanel(panel) {
        if (!panel?.panelId || !panel?.renderPanel || !panel?.rendersInPanel || !this.isPanelEnabled(panel.panelId)) return nothing;
        return panel.renderPanel();
    }

    isViewCloseDisabled(viewId, options = {}) {
        const disableFlag = options.disableCloseWhileGenerating;
        const isGenerating = this.aiState?.isGenerating;
        return (!!disableFlag && !!isGenerating) || (viewId === 'ai-prompt' && !!isGenerating);
    }

    syncDockManagerFromLayout(layouts = {}) {
        if (!this.dockManager || !layouts) return;
        const managerPositions = this.dockManager.getState().positions || {};
        Object.entries(layouts).forEach(([toolbarId, position]) => {
            if (managerPositions[toolbarId] !== position) {
                this.dockManager.setPosition(toolbarId, position);
            }
        });
    }

    handleDockPositionChange = (e) => {
        const { toolbarId, position } = e.detail || {};
        if (!toolbarId || !position) return;
        this.dispatch({ type: 'layout/setDock', toolbarId, position });
    };

    handleUiEvent = (e: CustomEvent<HandlerMessage | { type?: string; payload?: unknown }>) => {
        this.workspaceUiHandlers.routeMessage(e.detail);
    };

    handleWorkspaceClick = () => {
        this.dockManager.closePicker();
    };

    render() {
        const viewsLayout = this.getDockLayout('views', 'bottom-center');
        const sizeLayout = this.getDockLayout('size', 'bottom-right');
        const expandersLayout = this.getDockLayout('expanders', 'top-center'); 

        const expandedLeft = this.layoutState.expansion?.left;
        const expandedRight = this.layoutState.expansion?.right;
        const expandedBottom = this.layoutState.expansion?.bottom;
        const overlayView = this.layoutState.overlayView;

        return html`
            <div class="workspace" @click="${this.handleWorkspaceClick}" @ui-event="${this.handleUiEvent}">
                
                <main-menu></main-menu>

                <input type="file" id="fileInput" class="file-input" @change="${this.handleFileLoad}" accept=".json">

                <div class="side-panel left-panel ${expandedLeft ? 'open' : ''}">
                    <panel-view .viewId="${'visual-editor'}">
                         <div style="padding: 20px; color: #fff;">
                            <h3>Left Panel</h3>
                         </div>
                    </panel-view>
                </div>

                <main>
                    <div 
                        class="layout-container" 
                        style="--panel-width: ${this.computedLayoutWidth}"
                    >
                        ${this.panelRegistry.map((panel) => this.renderPanel(panel))}
                    </div>
                </main>

                <div class="side-panel right-panel ${expandedRight ? 'open' : ''}">
                    <panel-view .viewId="${'settings'}">
                         <div style="padding: 20px; color: #fff;">
                            <h3>Right Panel</h3>
                         </div>
                    </panel-view>
                </div>

                <div class="bottom-panel ${expandedBottom ? 'open' : ''}">
                     <div style="padding: 20px; color: #fff; height: 100%; display: flex; align-items: center; justify-content: center;">
                        <h3>Bottom Expansion Area</h3>
                     </div>
                </div>

                <dock-container 
                    .manager="${this.dockManager}" 
                    toolbarId="views" 
                    .fallbackPosition="${'bottom-center'}"
                    .layoutConfig="${viewsLayout}"
                    @toolbar-position-change="${this.handleDockPositionChange}"
                >
                    <view-controls
                        .orientation="${viewsLayout.orientation}"
                    ></view-controls>
                </dock-container>

                <dock-container 
                    .manager="${this.dockManager}" 
                    toolbarId="size" 
                    .fallbackPosition="${'bottom-right'}"
                    .layoutConfig="${sizeLayout}"
                    @toolbar-position-change="${this.handleDockPositionChange}"
                >
                    <size-controls
                        .orientation="${sizeLayout.orientation}"
                    ></size-controls>
                </dock-container>

                <dock-container 
                    .manager="${this.dockManager}" 
                    toolbarId="expanders" 
                    .fallbackPosition="${'top-center'}" 
                    .layoutConfig="${expandersLayout}"
                    @toolbar-position-change="${this.handleDockPositionChange}"
                >
                    <expander-controls
                        .orientation="${expandersLayout.orientation}"
                    ></expander-controls>
                </dock-container>

                <!-- Overlay Expander (Top) -->
                <overlay-expander
                    .viewId="${overlayView}"
                ></overlay-expander>

            </div>
        `;
    }
}
customElements.define('workspace-root', AppRoot);
