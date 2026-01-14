// @ts-nocheck
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { uiStateContext } from '../../core/state/contexts.ts';
import type { UiStateContextValue } from '../../core/state/ui-state.ts';
import { dispatchUiEvent } from '../../shared/utils/dispatch-ui-event';

export class AppProjectLibraryModal extends LitElement {
    @property({ type: Array }) projectsList = [];
    @property({ type: Array }) savedProjects = [];

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
            gap: 24px;
            padding: 24px;
        }

        .action-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
        }

        .action-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 12px;
            background-color: #1f2937;
            border: 1px dashed #374151;
            border-radius: 12px;
            color: #d1d5db;
            cursor: pointer;
            transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
        }



        .action-card svg {
            width: 24px;
            height: 24px;
            color: #6b7280;
            margin-bottom: 4px;
            transition: color 0.2s ease;
        }



        .action-label {
            font-size: 12px;
        }

        .section {
            border-top: 1px solid #1f2937;
            padding-top: 16px;
        }

        .section-title {
            display: block;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #9ca3af;
            margin-bottom: 8px;
        }

        .list-container {
            background-color: #030712;
            border: 1px solid #1f2937;
            border-radius: 12px;
            max-height: 192px;
            overflow-y: auto;
            margin-bottom: 16px;
        }

        .list-container:last-child {
            margin-bottom: 0;
        }

        .empty-state {
            padding: 16px;
            text-align: center;
            font-size: 14px;
            color: #4b5563;
            font-style: italic;
        }

        .list {
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .list-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px;
            border-top: 1px solid #1f2937;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .list-item:first-child {
            border-top: none;
        }



        .item-name {
            display: block;
            font-size: 14px;
            color: #d1d5db;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }



        .tags {
            display: flex;
            gap: 4px;
            margin-top: 4px;
            overflow: hidden;
        }

        .tag {
            padding: 0 4px;
            background-color: #1f2937;
            border-radius: 4px;
            font-size: 10px;
            color: #9ca3af;
            white-space: nowrap;
        }

        .delete-button {
            padding: 4px;
            border: none;
            border-radius: 6px;
            background: transparent;
            color: #4b5563;
            cursor: pointer;
            transition: color 0.2s ease, background-color 0.2s ease;
            flex-shrink: 0;
            margin-left: 8px;
        }


    `;

    render() {
        const projectState = this.uiState?.state.project;
        const projectsList = projectState?.projectsList ?? this.projectsList;
        const savedProjects = projectState?.savedProjects ?? this.savedProjects;

        return html`
            <div class="modal-body">
                <div class="action-grid">
                    <button @click="${() => dispatchUiEvent(this, 'view/open', { viewId: 'import-paste', options: { backTo: 'open-library' }, mode: 'paste' })}" class="action-card">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        <span class="action-label">Import/Paste File</span>
                    </button>
                    <button @click="${() => dispatchUiEvent(this, 'file/load', { mode: 'file', backTo: 'open-library' })}" class="action-card secondary">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <span class="action-label">Load Local File</span>
                    </button>
                </div>

                <div class="section">
                    <label class="section-title">Cloud Library (API)</label>
                    <div class="list-container">
                        ${projectsList.length === 0 ? html`
                            <div class="empty-state">No cloud projects found.</div>
                        ` : html`
                            <ul class="list">
                                ${projectsList.map(project => html`
                                    <li @click="${() => dispatchUiEvent(this, 'projects/load/start', { id: project.id, source: 'cloud' })}" class="list-item">
                                        <div class="item-details">
                                            <span class="item-name">${project.name}</span>
                                            <div class="tags">
                                                ${project.tags && project.tags.map(tag => html`<span class="tag">${tag}</span>`)}
                                            </div>
                                        </div>
                                        <button @click="${(e) => dispatchUiEvent(this, 'projects/delete/start', { id: project.id, source: 'cloud', event: e })}" class="delete-button" title="Delete Cloud Project">
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </li>
                                `)}
                            </ul>
                        `}
                    </div>
                </div>

                <div class="section">
                    <label class="section-title">Local Browser Storage</label>
                    <div class="list-container">
                        ${savedProjects.length === 0 ? html`
                            <div class="empty-state">No local projects found.</div>
                        ` : html`
                            <ul class="list">
                                ${savedProjects.map((entry) => {
                                    const name = typeof entry === 'string' ? entry : entry?.name;
                                    return html`
                                        <li @click="${() => dispatchUiEvent(this, 'projects/load/start', { id: name, source: 'local' })}" class="list-item">
                                            <span class="item-name">${name}</span>
                                            <button @click="${(e) => dispatchUiEvent(this, 'projects/delete/start', { id: name, source: 'local', event: e })}" class="delete-button" title="Delete Local Project">
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </li>
                                    `;
                                })}
                            </ul>
                        `}
                    </div>
                </div>
            </div>
        `;
    }
}
customElements.define('project-library-modal', AppProjectLibraryModal);
