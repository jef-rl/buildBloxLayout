// @ts-nocheck
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { uiStateContext } from '../../core/state/contexts.ts';
import type { UiStateContextValue } from '../../core/state/ui-state.ts';
import { dispatchUiEvent } from '../../shared/utils/dispatch-ui-event';

export class AppProjectSaveModal extends LitElement {
    @property({ type: String }) projectId = '';
    @property({ type: String }) projectName = '';
    @property({ type: Array }) projectTags = [];
    @property({ type: String }) userId = 'test-user';

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
            gap: 16px;
            padding: 24px;
        }

        .meta {
            font-size: 12px;
            color: #6b7280;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            display: flex;
            justify-content: space-between;
        }

        .meta-highlight {
            color: #60a5fa;
        }

        .field {
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

        .input {
            width: 100%;
            background-color: #030712;
            border: 1px solid #374151;
            border-radius: 12px;
            padding: 8px 16px;
            color: #ffffff;
            font-size: 14px;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
        }

        .input.purple:focus {
            border-color: #a855f7;
            box-shadow: 0 0 0 1px #a855f7;
        }

        .actions {
            padding-top: 16px;
        }

        .save-button {
            width: 100%;
            padding: 8px 0;
            background-color: #16a34a;
            border: none;
            border-radius: 12px;
            color: #ffffff;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 10px 20px rgba(20, 83, 45, 0.2);
        }


        .save-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            box-shadow: none;
        }
    `;

    render() {
        const project = this.uiState?.state.project;
        const projectId = project?.id ?? this.projectId;
        const projectName = project?.name ?? this.projectName;
        const projectTags = project?.tags ?? this.projectTags;
        const userId = project?.userId ?? this.userId;
        const isUpdate = !!projectId;
        const tagsString = Array.isArray(projectTags) ? projectTags.join(', ') : projectTags;
        const normalizeTags = (value) => value
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);

        return html`
            <div class="modal-body">
                <div class="meta">
                    <span>User: ${userId}</span>
                    ${isUpdate ? html`<span class="meta-highlight">ID: ${projectId.slice(0, 8)}...</span>` : nothing}
                </div>
                <div class="field">
                    <label class="label">Project Name</label>
                    <input type="text" .value="${projectName}" @input="${(e) => dispatchUiEvent(this, 'projects/setMeta', { project: { name: e.target.value } })}" class="input" placeholder="e.g. Profile Card Generator">
                </div>
                <div class="field">
                    <label class="label">Tags (Comma-Separated)</label>
                    <input type="text" .value="${tagsString}" @input="${(e) => dispatchUiEvent(this, 'projects/setMeta', { project: { tags: normalizeTags(e.target.value) } })}" class="input purple" placeholder="e.g. responsive, dark-mode, widget">
                </div>

                <div class="actions">
                    <button 
                        @click="${() => dispatchUiEvent(this, 'projects/save/start')}"
                        class="save-button"
                        ?disabled="${!projectName}"
                    >
                        ${isUpdate ? 'Update Project (PUT)' : 'Create New Project (POST)'}
                    </button>
                </div>
            </div>
        `;
    }
}
customElements.define('project-save-modal', AppProjectSaveModal);
