// import { LitElement, html, css, nothing } from 'lit';
// import { property } from 'lit/decorators.js';
// import { ContextConsumer } from '@lit/context';
// import { uiStateContext } from '../../../state/context';
// import type { UiStateContextValue } from '../../../state/ui-state';
// import type { ViewDefinitionSummary } from '../../../types/state';
// import { Icons } from '../../../components/Icons';

// export class Workspace extends LitElement {
//     @property({ type: String }) orientation = 'row';

//     private uiState: UiStateContextValue['state'] | null = null;
//     private uiDispatch: UiStateContextValue['dispatch'] | null = null;
//     private _consumer = new ContextConsumer(this, {
//         context: uiStateContext,
//         subscribe: true,
//         callback: (value: UiStateContextValue | undefined) => {
//             this.uiState = value?.state ?? null;
//             this.uiDispatch = value?.dispatch ?? null;
//             this.requestUpdate();
//         },
//     });

//     // Zoom state
//     @property({ type: Number }) private zoomLevel = 1;

//     static styles = css`
//         :host {
//             display: block;
//         }

//         .workspace-toolbar {
//             display: grid;
//             gap: 8px;
//             padding: 4px 8px;
//             background: #1e293b;
//             border-radius: 6px;
//             align-items: center;
//             width: 100%;
//             box-sizing: border-box;
//         }

//         .workspace-toolbar.row {
//             grid-template-columns: auto 1fr auto auto;
//             grid-template-areas: "expander views zoom scale";
//         }

//         .workspace-toolbar.column {
//             grid-template-columns: 1fr;
//             grid-template-areas:
//                 "expander"
//                 "views"
//                 "zoom"
//                 "scale";
//         }

//         /* Expander Controls Section */
//         .expander-section {
//             grid-area: expander;
//             display: flex;
//             align-items: center;
//             gap: 4px;
//         }

//         .expander-section.column {
//             flex-direction: column;
//         }

//         /* View Controls Section */
//         .views-section {
//             grid-area: views;
//             display: grid;
//             gap: 2px;
//             min-width: 0;
//         }

//         .views-section.row {
//             grid-template-columns: 1fr;
//             grid-template-rows: 16px 24px;
//         }

//         .views-section.column {
//             grid-template-rows: auto 1fr;
//             gap: 6px;
//         }

//         /* Zoom Controls Section */
//         .zoom-section {
//             grid-area: zoom;
//             display: flex;
//             align-items: center;
//             gap: 2px;
//             background: #0f172a;
//             padding: 2px;
//             border-radius: 4px;
//         }

//         .zoom-button {
//             padding: 4px 8px;
//             border: none;
//             background: transparent;
//             color: #94a3b8;
//             font-size: 11px;
//             font-weight: 600;
//             cursor: pointer;
//             border-radius: 3px;
//             transition: all 0.2s ease;
//             min-width: 28px;
//         }

//         .zoom-button:hover {
//             background: #1e293b;
//             color: #e2e8f0;
//         }

//         .zoom-button.active {
//             background: #3b82f6;
//             color: white;
//         }

//         /* Scale Controls Section */
//         .scale-section {
//             grid-area: scale;
//             display: flex;
//             align-items: center;
//             gap: 4px;
//         }

//         /* Shared Button Styles */
//         .icon-button {
//             position: relative;
//             padding: 6px;
//             border-radius: 999px;
//             border: none;
//             background: transparent;
//             color: #9ca3af;
//             cursor: pointer;
//             transition: background-color 0.2s ease, color 0.2s ease;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//         }

//         .icon-button:hover {
//             color: #ffffff;
//             background-color: #374151;
//         }

//         .icon-button.active {
//             color: #60a5fa;
//             background-color: rgba(17, 24, 39, 0.5);
//         }

//         .icon {
//             width: 18px;
//             height: 18px;
//         }

//         .separator {
//             background-color: #374151;
//         }

//         .separator.row {
//             width: 1px;
//             height: 16px;
//             margin: 0 4px;
//         }

//         .separator.column {
//             width: 16px;
//             height: 1px;
//             margin: 4px 0;
//         }

//         /* Slot Strip */
//         .slot-strip {
//             display: grid;
//             grid-auto-columns: 24px;
//             align-items: center;
//             gap: 2px 0px;
//             width: 100%;
//             max-width: 100%;
//             box-sizing: border-box;
//             z-index: 10;
//             grid-area: 1 / 1 / 3 / 6;
//             grid-auto-flow: column;
//             padding-bottom: 16px;
//             min-height: 40px;
//         }

//         .slot {
//             display: inline-flex;
//             flex-direction: row;
//             align-items: center;
//             justify-content: center;
//             gap: 0px;
//             height: 40px;
//             min-width: 24px;
//             padding: 0px;
//             border-radius: 4px 4px 0 0;
//             border: transparent solid;
//             border-width: 0 0 24px 0;
//             background: transparent;
//             color: #94a3b8;
//             font-size: 10px;
//             font-weight: 600;
//             cursor: pointer;
//             transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
//         }

//         .slot--active {
//             border-color: rgb(0,64,32);
//             background: rgb(0, 64, 32);
//             color: #d1fae5;
//         }

//         .slot__label {
//             display: inline-flex;
//             align-items: center;
//             justify-content: center;
//             min-width: 16px;
//             height: 16px;
//             padding: 0;
//             border-radius: 999px;
//             font-size: 14px;
//         }

//         /* Token Pool */
//         .token-pool {
//             display: grid;
//             align-items: center;
//             gap: 0px;
//             width: 100%;
//             max-width: 100%;
//             box-sizing: border-box;
//             grid-area: 2 / 1 / 3 / -1;
//             z-index: 100;
//             grid-auto-columns: 24px;
//             grid-auto-flow: column;
//         }

//         .token {
//             display: inline-flex;
//             align-items: center;
//             gap: 2px;
//             padding: 2px 4px;
//             border-radius: 4px;
//             color: #cbd5f5;
//             font-size: 10px;
//             font-weight: 600;
//             cursor: grab;
//             transition: border-color 0.2s ease, background-color 0.2s ease;
//         }

//         .token:active {
//             cursor: grabbing;
//         }

//         .token__icon {
//             display: inline-flex;
//             align-items: center;
//             justify-content: center;
//             min-width: 14px;
//             height: 14px;
//         }

//         .token__icon img {
//             width: 14px;
//             height: 14px;
//         }

//         .views-section.row .token {
//             padding: 2px 4px;
//             font-size: 9px;
//         }
//     `;

//     connectedCallback() {
//         super.connectedCallback();
//     }

//     disconnectedCallback() {
//         super.disconnectedCallback();
//     }

//     get panelLimit() {
//         const layout = this.uiState?.layout ?? { mainAreaCount: 1, mainViewOrder: [] };
//         const rawCount = Number(layout.mainAreaCount ?? 1);
//         const clamped = Math.min(5, Math.max(1, Number.isFinite(rawCount) ? rawCount : 1));
//         return clamped;
//     }

//     private getViewLabel(view: { title?: string; name?: string; id?: string }) {
//         return view.title || view.name || view.id || '';
//     }

//     private getViewIcon(view: { icon?: string; title?: string; name?: string; id?: string }) {
//         if (view.icon) {
//             return view.icon;
//         }
//         return Icons[Math.floor(Math.random() * Icons.length)];
//     }

//     private resolvePanelViewId(panel: { activeViewId?: string; viewId?: string; view?: unknown } | null) {
//         return panel?.activeViewId ?? panel?.viewId ?? (panel as any)?.view?.component ?? null;
//     }

//     private resolveActiveMainViews() {
//         const uiState = this.uiState;
//         const panels = uiState && Array.isArray(uiState.panels) ? uiState.panels : [];
//         return panels
//             .filter((panel) => panel.region === 'main')
//             .map((panel) => this.resolvePanelViewId(panel))
//             .filter(Boolean);
//     }

//     private resolveTokenViewOrder(): string[] {
//         const layout = this.uiState?.layout ?? { mainAreaCount: 1, mainViewOrder: [] };
//         const layoutOrder = Array.isArray(layout.mainViewOrder) ? layout.mainViewOrder : [];
//         const views = this.uiState?.viewDefinitions ?? [];
//         const viewIds: string[] = views.map((view: ViewDefinitionSummary) => view.id);
//         const ordered: string[] = layoutOrder.filter((viewId: string) => viewIds.includes(viewId));
//         viewIds.forEach((viewId: string) => {
//             if (!ordered.includes(viewId)) {
//                 ordered.push(viewId);
//             }
//         });
//         return ordered;
//     }
   
//     render() {
//         const isRow = this.orientation === 'row';
//         const views = this.uiState?.viewDefinitions ?? [];
//         const activeOrder = this.resolveActiveMainViews();

//         const expansion = this.uiState?.layout?.expansion ?? {
//             expanderLeft: 'Closed',
//             expanderRight: 'Closed',
//             expanderBottom: 'Closed'
//         };
//         const overlayOpen = !!this.uiState?.layout?.overlayView;

//         const toolbarClass = `workspace-toolbar ${isRow ? 'row' : 'column'}`;
//         const expanderClass = `expander-section ${isRow ? '' : 'column'}`;
//         const viewsClass = `views-section ${isRow ? 'row' : 'column'}`;
//         const separatorClass = `separator ${isRow ? 'row' : 'column'}`;

//         const zoomLevels = [1, 2, 3, 4, 5];

//         return html`
            

          

            
       
//         `;
//     }
// }

// customElements.define('workspace-controls', Workspace);
