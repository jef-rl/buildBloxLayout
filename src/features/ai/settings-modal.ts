// @ts-nocheck
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { uiStateContext } from '../../core/state/contexts.ts';
import type { UiStateContextValue } from '../../core/state/ui-state.js';
import { dispatchUiEvent } from '../../shared/utils/dispatch-ui-event';

export class AppSettingsModal extends LitElement {
    @consume({ context: uiStateContext, subscribe: true })
    @property({ attribute: false })
    uiState?: UiStateContextValue;

    static styles = css`
        :host {
            display: block;
        }

        .modal-body {
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 24px;
            overflow-y: auto;
        }

        .description {
            font-size: 14px;
            color: #9ca3af;
        }

        .group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .label {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #9ca3af;
        }

        .textarea {
            width: 100%;
            height: 96px;
            background-color: #030712;
            border: 1px solid #374151;
            border-radius: 12px;
            padding: 12px;
            font-size: 12px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            color: #d1d5db;
            resize: none;
        }

        .note {
            font-size: 12px;
            color: #6b7280;
        }

        .actions {
            padding-top: 16px;
            display: flex;
            justify-content: flex-end;
        }

        .close-button {
            padding: 8px 16px;
            background-color: #2563eb;
            border: none;
            border-radius: 12px;
            color: #ffffff;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }


    `;

    close() {
        dispatchUiEvent(this, 'view/close');
    }

    handleSystemInstructionChange(panel, e) {
        dispatchUiEvent(this, 'ai/setInstruction', { panelId: panel, instruction: e.target.value });
    }

    render() {
        const aiSystemInstructions = this.uiState?.state.ai.systemInstructions ?? {};
        return html`
            <div class="modal-body">
                <p class="description">Customize the system instructions sent to Gemini to ensure the output format (JSON, HTML snippet, pure CSS) is clean and correct.</p>

                ${['scope', 'template', 'styles'].map(panel => html`
                    <div class="group">
                        <label class="label">
                            ${panel.charAt(0).toUpperCase() + panel.slice(1)} Instructions:
                        </label>
                        <textarea 
                            class="textarea"
                            .value="${aiSystemInstructions[panel] ?? ''}"
                            @input="${(e) => this.handleSystemInstructionChange(panel, e)}"
                            placeholder="System instruction for Gemini model..."
                        ></textarea>
                        <p class="note">
                            Note: The Template instruction will be automatically prepended with available scope keys.
                        </p>
                    </div>
                `)}

                <div class="actions">
                    <button @click="${() => this.close()}" class="close-button">
                        Close Settings
                    </button>
                </div>
            </div>
        `;
    }
}
customElements.define('settings-modal', AppSettingsModal);
