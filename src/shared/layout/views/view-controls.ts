// @ts-nocheck
import { LitElement, html, nothing, css } from 'lit';
import { property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../core/state/contexts.ts';
import type { UiStateContextValue } from '../../../core/state/ui-state.js';
import { createViewControlsHandlers } from '../../../handlers/layout/view-controls.handlers';
import { viewsRegistry } from '../../../core/registry/views';

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

        .scope-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .scope-group.column {
            flex-direction: column;
            gap: 8px;
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

    

        .icon {
            width: 20px;
            height: 20px;
        }

        .status {
            position: absolute;
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            width: 10px;
            height: 10px;
            pointer-events: none;
        }

        .status-ping {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 999px;
            opacity: 0.75;
            animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .status-dot {
            position: relative;
            width: 10px;
            height: 10px;
            border-radius: 999px;
        }

        .status-dot.ok {
            background-color: #22c55e;
        }

        .status-dot.error {
            background-color: #ef4444;
        }

        .status-ping.error {
            background-color: #f87171;
        }

        .scope-mode {
            display: flex;
            gap: 4px;
            padding: 2px;
            border: 1px solid #4b5563;
            background-color: #1f2937;
            border-radius: 6px;
        }

        .scope-mode.column {
            flex-direction: column;
        }

        .mode-button {
            padding: 4px;
            border: none;
            border-radius: 4px;
            background: transparent;
            color: #9ca3af;
            cursor: pointer;
            transition: background-color 0.2s ease, color 0.2s ease;
        }

    

        .mode-button.active {
            background-color: #2563eb;
            color: #ffffff;
        }

        .mode-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .mode-icon {
            width: 14px;
            height: 14px;
        }

        .separator {
            background-color: #374151;
        }

        .separator.row {
            width: 1px;
            height: 16px;
        }

        .separator.column {
            width: 16px;
            height: 1px;
        }

        @keyframes ping {
            0% {
                transform: scale(1);
                opacity: 1;
            }
            75%, 100% {
                transform: scale(1.8);
                opacity: 0;
            }
        }
    `;

    get resolvedPanelStates() {
        const fallback = this.panelStates || {};
        const openState = this.uiState?.panels?.open || {};
        const scopeMode = this.uiState?.panels?.data?.scope?.mode;

        return {
            openState,
            fallback,
            scopeMode: scopeMode ?? fallback.scopeMode ?? 'visual',
        };
    }

    get resolvedErrors() {
        const fallback = this.errors || {};
        const panelErrors = this.uiState?.panels?.errors || {};
        const scopeData = this.uiState?.panels?.data?.scope || {};
        const previewData = this.uiState?.panels?.data?.preview || {};

        return {
            jsonError: panelErrors.scope ?? scopeData.jsonError ?? fallback.jsonError ?? '',
            renderError: panelErrors.preview ?? previewData.renderError ?? fallback.renderError ?? '',
        };
    }

    render() {
        const isColumn = this.orientation === 'column';
        const separatorClass = `separator ${isColumn ? 'column' : 'row'}`;
        const { openState, fallback, scopeMode } = this.resolvedPanelStates;
        const { jsonError, renderError } = this.resolvedErrors;
        const exportError = jsonError || renderError;
        const resolvedErrors = { jsonError, renderError, exportError };

        return html`
            <div class="controls ${isColumn ? 'column' : ''}" @click="${this.handlers.stopClickPropagation}">
                ${viewsRegistry.filter((view) => view.controls && view.panelId).map((view) => {
                    const isOpen = openState[view.panelId] ?? fallback[`${view.panelId}Open`] ?? false;
                    const control = view.controls;
                    const statusKey = control?.statusKey;
                    const hasError = statusKey ? !!resolvedErrors[statusKey] : false;
                    const showPing = control?.statusPing && hasError;
                    const statusClass = hasError ? 'error' : 'ok';
                    const shouldShowStatus = !!control?.statusKey || view.id === 'styles';

                    if (control?.variant === 'scope') {
                        return html`
                            <div class="scope-group ${isColumn ? 'column' : ''}">
                                <button
                                    @click="${() => this.handlers.togglePanel(view.id, view.panelId)}"
                                    class="icon-button ${isOpen ? 'active' : ''}"
                                    title="${control.title}"
                                >
                                    ${control.icon}
                                    <span class="status">
                                        ${showPing ? html`<span class="status-ping error"></span>` : nothing}
                                        <span class="status-dot ${statusClass}"></span>
                                    </span>
                                </button>

                                ${isOpen ? html`
                                    <div class="scope-mode ${isColumn ? 'column' : ''}">
                                        <button
                                            @click="${() => this.handlers.setScopeMode('text')}"
                                            class="mode-button ${scopeMode === 'text' || jsonError ? 'active' : ''}"
                                            title="JSON Source"
                                        >
                                            <svg class="mode-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                        </button>
                                        <button
                                            @click="${() => this.handlers.setScopeMode('visual')}"
                                            class="mode-button ${scopeMode === 'visual' && !jsonError ? 'active' : ''}"
                                            ?disabled="${!!jsonError}"
                                            title="${jsonError ? 'Fix JSON error first' : 'Visual Editor'}"
                                        >
                                            <svg class="mode-icon" fill="none" stroke="${jsonError ? '#f87171' : 'currentColor'}" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                        </button>
                                    </div>
                                ` : nothing}
                            </div>
                            ${control.separatorAfter ? html`<div class="${separatorClass}"></div>` : nothing}
                        `;
                    }

                    return html`
                        <button
                            @click="${() => this.handlers.togglePanel(view.id, view.panelId)}"
                            class="icon-button ${isOpen ? 'active' : ''}"
                            title="${control?.title}"
                        >
                            ${control?.icon}
                            ${shouldShowStatus ? html`
                                <span class="status">
                                    ${showPing ? html`<span class="status-ping error"></span>` : nothing}
                                    <span class="status-dot ${statusClass}"></span>
                                </span>
                            ` : nothing}
                        </button>
                        ${control?.separatorAfter ? html`<div class="${separatorClass}"></div>` : nothing}
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
