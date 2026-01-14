import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { uiStateContext } from '../../core/state/contexts.ts';
import type { UiStateContextValue } from '../../core/state/ui-state.js';
import { dispatchUiEvent } from '../../shared/utils/dispatch-ui-event';

export class AppAiPromptModal extends LitElement {
    @consume({ context: uiStateContext, subscribe: true })
    @property({ attribute: false })
    uiState?: UiStateContextValue;

    static styles = css`
        :host {
            display: block;
        }

        .modal-body {
            display: flex;
            flex-direction: column;
            height: 100%;
            gap: 16px;
            padding: 24px;
        }

        .label {
            font-size: 14px;
            color: #d1d5db;
            margin-bottom: 8px;
        }

        .textarea {
            width: 100%;
            height: 128px;
            background-color: #030712;
            border: 1px solid #374151;
            border-radius: 12px;
            padding: 12px;
            font-size: 14px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            color: #d1d5db;
            resize: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .textarea::placeholder {
            color: #4b5563;
        }

        .textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
        }

        .generate-button {
            width: 100%;
            padding: 8px 0;
            border: none;
            border-radius: 12px;
            font-weight: 700;
            color: #ffffff;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: linear-gradient(90deg, #2563eb, #7c3aed);
            box-shadow: 0 10px 20px rgba(76, 29, 149, 0.2);
            transition: filter 0.2s ease, opacity 0.2s ease;
        }



        .generate-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .icon {
            width: 16px;
            height: 16px;
        }
    `;

    handleAiPromptChange(e: Event) {
        const target = e.target as HTMLTextAreaElement | null;
        const value = target?.value ?? '';
        const activePanel = this.uiState?.state.ai.activePanel;
        dispatchUiEvent(this, 'ai/setPrompt', { prompt: value, panelId: activePanel });
    }

    requestGeneration() {
        const activePanel = this.uiState?.state.ai.activePanel;
        if (!activePanel) return;
        dispatchUiEvent(this, 'ai/generate/start', { panelId: activePanel });
    }

    render() {
        const aiState = this.uiState?.state.ai;
        const promptInput = aiState?.promptInput ?? '';
        const activePanel = aiState?.activePanel ?? '';
        const isGenerating = aiState?.isGenerating ?? false;
        const placeholder =
            activePanel === 'scope'
                ? 'e.g. A list of 5 users with name, email, and role.'
                : activePanel === 'template'
                    ? 'e.g. A responsive card grid displaying user details.'
                    : 'e.g. Modern dark theme with rounded corners and hover effects.';

        return html`
            <div class="modal-body">
                <div>
                    <p class="label">Describe what you want to generate:</p>
                    <textarea 
                        class="textarea"
                        .value="${promptInput}"
                        @input="${this.handleAiPromptChange}"
                        placeholder="${placeholder}"
                    ></textarea>
                </div>
                <button 
                    @click="${this.requestGeneration}"
                    class="generate-button"
                    ?disabled="${!promptInput.trim() || isGenerating}"
                >
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    <span>${isGenerating ? 'Generating...' : 'Generate'}</span>
                </button>
            </div>
        `;
    }
}
customElements.define('ai-prompt-modal', AppAiPromptModal);
