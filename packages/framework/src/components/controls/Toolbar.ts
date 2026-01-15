// @ts-nocheck
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../state/context';
import type { UiStateContextValue } from '../../state/ui-state';
import { createViewControlsHandlers } from '../../handlers/layout/view-controls.handlers';
import { ViewRegistry } from '../../registry/ViewRegistryInstance';

export class ViewControls extends LitElement {
    @property({ attribute: false }) panelStates = {};
    @property({ attribute: false }) errors = {};
    @property({ type: String }) orientation = 'row';

    private uiState: UiStateContextValue['state'] | null = null;
    private _consumer = new ContextConsumer(this, {
        context: uiStateContext,
        subscribe: true,
        callback: (value: UiStateContextValue | undefined) => {
            this.uiState = value?.state ?? this.uiState;
            this.requestUpdate();
        },
    });
    private handlers = createViewControlsHandlers(this);

    static styles = css`
        :host {
            display: block;
        }

        .controls {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .controls.column {
            flex-direction: column;
            gap: 12px;
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

  

        .icon-button.active {
            color: #ffffff;
            background-color: rgba(17, 24, 39, 0.5);
        }

        .icon-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

    

        .icon {
            width: 20px;
            height: 20px;
        }

        .icon-label {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: currentColor;
        }
    `;

    get panelLimit() {
        const layout = this.uiState?.layout ?? {};
        const mode = layout.viewportWidthMode ?? 'auto';
        const rawCount = Number(layout.mainAreaCount ?? 1);
        const viewportCount = mode === 'auto' ? NaN : Number.parseInt(mode, 10);
        const effectiveCount = Number.isFinite(viewportCount) ? viewportCount : rawCount;
        const clamped = Math.min(5, Math.max(1, Number.isFinite(effectiveCount) ? effectiveCount : 1));
        return clamped;
    }

    private getTargetPanelId() {
        const panelsState = this.uiState?.panels;
        const explicitTarget = panelsState?.data?.targetPanelId;
        if (explicitTarget) {
            return explicitTarget;
        }

        const panels = Array.isArray(panelsState) ? panelsState : this.uiState?.panels;
        if (Array.isArray(panels)) {
            const mainPanel = panels.find((panel) => panel.region === 'main');
            return mainPanel?.id ?? panels[0]?.id;
        }

        return undefined;
    }

    render() {
        const isColumn = this.orientation === 'column';
        const views = ViewRegistry.getAllViews();
        const panels = Array.isArray(this.uiState?.panels) ? this.uiState?.panels : [];
        const assignedViews = new Set(
            panels.map((panel) => panel?.activeViewId ?? panel?.viewId).filter(Boolean),
        );
        const targetPanelId = this.getTargetPanelId();

        return html`
            <div class="controls ${isColumn ? 'column' : ''}" @click="${this.handlers.stopClickPropagation}">
                ${views.map((view) => {
                    const label = view.title || view.name || view.id;
                    const isAssigned = assignedViews.has(view.id);
                    const iconLabel = label.replace(/[^a-z0-9]/gi, '').slice(0, 2) || view.id.slice(0, 2);
                    const isDisabled = !targetPanelId || panels.length === 0 || this.panelLimit < 1;
                    return html`
                        <button
                            @click="${() => this.handlers.assignView(view.id, targetPanelId)}"
                            class="icon-button ${isAssigned ? 'active' : ''}"
                            title="${label}"
                            aria-label="${label}"
                            ?disabled="${isDisabled}"
                        >
                            <span class="icon-label">${iconLabel}</span>
                        </button>
                    `;
                })}
                
                <!-- Reset/New Session Button -->
                    <button @click="${this.handlers.resetSession}" class="icon-button reset" title="New Session / Reset">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                </button>
            </div>
        `;
    }
}
customElements.define('view-controls', ViewControls);
