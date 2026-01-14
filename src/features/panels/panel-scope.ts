// @ts-nocheck
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import '../../shared/components/json-editor/json-editor';
import { panelStateContext, uiDispatchContext } from '../../core/state/contexts.ts';
import type { PanelsState, UiDispatch } from '../../core/state/ui-state.js';

export class AppPanelScope extends LitElement {
    @consume({ context: panelStateContext, subscribe: true })
    @property({ attribute: false })
    panelsState?: PanelsState;

    @consume({ context: uiDispatchContext, subscribe: true })
    @property({ attribute: false })
    dispatch?: UiDispatch;

    static styles = css`
        :host {
            display: block;
        }

        .panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 300px;
            background-color: #030712;
            height: 100%;
            position: relative;
            border-right: 1px solid #1f2937;
            transition: all 0.3s ease;
        }

        .controls {
            position: absolute;
            top: 8px;
            right: 16px;
            z-index: 10;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .mode-toggle {
            display: flex;
            background-color: #1f2937;
            border: 1px solid #374151;
            border-radius: 6px;
            padding: 2px;
        }

        .mode-button {
            padding: 4px;
            border: none;
            border-radius: 4px;
            background: transparent;
            color: #9ca3af;
            cursor: pointer;
            transition: color 0.2s ease, background-color 0.2s ease;
        }



        .mode-button.active {
            background-color: #2563eb;
            color: #ffffff;
        }

        .mode-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .icon {
            width: 14px;
            height: 14px;
        }

        .divider {
            width: 1px;
            height: 16px;
            background-color: #374151;
        }

        .ai-button {
            padding: 6px;
            background-color: #1f2937;
            border: 1px solid #374151;
            border-radius: 6px;
            color: #9ca3af;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            font-size: 12px;
            transition: background-color 0.2s ease, color 0.2s ease;
        }


        .content {
            flex: 1;
            position: relative;
            padding: 16px 0 80px;
        }

        .json-input {
            width: 100%;
            height: 100%;
            background-color: #030712;
            color: #d1d5db;
            padding: 16px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 12px;
            line-height: 1.5;
            border: none;
            resize: none;
            transition: background-color 0.2s ease;
        }

        .json-input:focus {
            outline: none;
            background-color: rgba(17, 24, 39, 0.5);
        }

        .error {
            position: absolute;
            bottom: 80px;
            left: 0;
            right: 0;
            background-color: rgba(127, 29, 29, 0.9);
            color: #fecaca;
            font-size: 12px;
            padding: 8px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            border-top: 1px solid #b91c1c;
        }
    `;

    render() {
        const scopeData = this.panelsState?.data?.scope ?? {};
        const isOpen = this.panelsState?.open?.scope ?? false;
        const mode = scopeData.mode ?? 'visual';
        const jsonInput = scopeData.jsonInput ?? '';
        const jsonError = scopeData.jsonError ?? '';
        const parsedScope = scopeData.parsedScope ?? {};

        if (!isOpen) return nothing;
        return html`
             <div class="panel">
                <!-- Header Controls -->
                <div class="controls">
                    
                    <!-- Mode Toggles -->
                    <div class="mode-toggle">
                        <button 
                            @click="${() => this.setScopeMode('text')}" 
                            class="mode-button ${mode === 'text' || jsonError ? 'active' : ''}" 
                            title="JSON Source"
                        >
                            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        </button>
                        <button 
                            @click="${() => this.setScopeMode('visual')}" 
                            class="mode-button ${mode === 'visual' && !jsonError ? 'active' : ''}" 
                            ?disabled="${!!jsonError}" 
                            title="${jsonError ? 'Fix JSON error first' : 'Visual Editor'}"
                        >
                            <svg class="icon" fill="none" stroke="${jsonError ? '#f87171' : 'currentColor'}" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </button>
                    </div>

                    <!-- Divider -->
                    <div class="divider"></div>

                    <!-- AI Button -->
                    <button @click="${() => this.openAi()}" class="ai-button" title="Generate with Gemini">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                    </button>
                </div>

                <div class="content">
                ${mode === 'visual' && !jsonError
                    ? html`<json-editor .data="${parsedScope}" @change="${this.handleScopeUpdate}"></json-editor>`
                    : html`
                        <textarea 
                            class="json-input"
                            .value="${jsonInput}"
                            @input="${this.handleJsonInput}"
                            spellcheck="false"
                            placeholder="Enter JSON Scope..."
                        ></textarea>
                        ${jsonError ? html`
                            <div class="error">
                                Error: ${jsonError}
                            </div>
                        ` : nothing}
                    `
                }
                </div>
            </div>
        `;
    }

    private setScopeMode(mode: 'visual' | 'text') {
        if (!this.dispatch) return;
        const jsonError = this.panelsState?.data?.scope?.jsonError;
        if (mode === 'visual' && jsonError) {
            alert('Cannot switch to Visual mode while JSON is invalid.');
            return;
        }
        this.dispatch({ type: 'panel/update', panelId: 'scope', data: { mode } });
    }

    private handleJsonInput = (event: Event) => {
        if (!this.dispatch) return;
        const jsonInput = (event.target as HTMLTextAreaElement)?.value ?? '';
        this.dispatch({ type: 'panel/update', panelId: 'scope', data: { jsonInput } });
        try {
            const parsedScope = JSON.parse(jsonInput || '{}');
            this.dispatch({ type: 'panel/update', panelId: 'scope', data: { parsedScope, jsonError: '' } });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            this.dispatch({ type: 'panel/update', panelId: 'scope', data: { jsonError: errorMessage } });
        }
    };

    private handleScopeUpdate = (event: CustomEvent) => {
        if (!this.dispatch) return;
        const parsedScope = event?.detail ?? event;
        this.dispatch({
            type: 'panel/update',
            panelId: 'scope',
            data: { parsedScope, jsonInput: JSON.stringify(parsedScope, null, 2), jsonError: '' },
        });
    };

    private openAi() {
        if (!this.dispatch) return;
        this.dispatch({ type: 'ai/open', panelId: 'scope', prompt: '' });
        this.dispatch({ type: 'view/open', viewId: 'ai-prompt', options: { disableCloseWhileGenerating: true } });
    }
}
customElements.define('panel-scope', AppPanelScope);
