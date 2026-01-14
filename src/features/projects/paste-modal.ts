// @ts-nocheck
import { LitElement, html, css } from 'lit';
import { dispatchUiEvent } from '../../shared/utils/dispatch-ui-event';

export class AppPasteModal extends LitElement {
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

        .description {
            font-size: 12px;
            color: #9ca3af;
        }

        .textarea {
            width: 100%;
            height: 192px;
            background-color: #030712;
            border: 1px solid #374151;
            border-radius: 12px;
            padding: 12px;
            font-size: 12px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            color: #d1d5db;
            resize: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
        }

        .primary-button,
        .secondary-button {
            width: 100%;
            padding: 8px 0;
            border-radius: 12px;
            border: none;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
        }

        .primary-button {
            background-color: #2563eb;
            color: #ffffff;
            box-shadow: 0 10px 20px rgba(30, 64, 175, 0.2);
        }

        .secondary-button {
            background-color: #4b5563;
            color: #ffffff;
        }
    `;

    render() {
        return html`
            <div class="modal-body">
                <p class="description">Paste the full project JSON content below (includes scope, template, and styles). You can also download the project file locally.</p>
                <textarea 
                    id="pasteInput"
                    class="textarea"
                    placeholder='{ "scope": "...", "template": "...", "styles": "..." }'
                ></textarea>
                <button 
                    @click="${() => dispatchUiEvent(this, 'paste/load', { content: (this.renderRoot.querySelector('#pasteInput')?.value || '') })}"
                    class="primary-button"
                >
                    Load Project
                </button>
                <button @click="${() => dispatchUiEvent(this, 'export/copy-trigger')}" class="secondary-button">
                    Download Current Project to Disk (.json)
                </button>
            </div>
        `;
    }
}
customElements.define('paste-modal', AppPasteModal);
