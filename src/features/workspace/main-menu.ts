// @ts-nocheck
import { LitElement, html, nothing, css } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { uiStateContext } from '../../core/state/contexts.ts';
import type { UiStateContextValue } from '../../core/state/ui-state.js';
import { dispatchUiEvent } from '../../shared/utils/dispatch-ui-event';

export class AppMainMenu extends LitElement {
    @consume({ context: uiStateContext, subscribe: true })
    @property({ attribute: false })
    uiState?: UiStateContextValue;

    static styles = css`
        :host {
            position: absolute;
            top: 12px;
            left: 12px;
            z-index: 50;
        }

        .menu-button {
            padding: 8px;
            background-color: #1f2937;
            border: 1px solid #374151;
            border-radius: 999px;
            color: #9ca3af;
            cursor: pointer;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
            transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
        }


        .menu-button:focus-visible {
            outline: 2px solid rgba(59, 130, 246, 0.5);
            outline-offset: 2px;
        }

        .menu-icon {
            width: 20px;
            height: 20px;
        }

        .menu-panel {
            position: absolute;
            top: calc(100% + 8px);
            left: 0;
            width: 224px;
            background-color: #1f2937;
            border: 1px solid #374151;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transform-origin: top left;
            animation: fade-in-down 0.2s ease;
        }

        .menu-header {
            padding: 12px 16px;
            border-bottom: 1px solid #374151;
            background-color: rgba(17, 24, 39, 0.6);
        }

        .menu-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }

        .menu-brand {
            font-weight: 700;
            font-size: 14px;
            color: #e5e7eb;
            letter-spacing: 0.04em;
        }

        .menu-brand span {
            color: #60a5fa;
        }

        .menu-id {
            font-size: 12px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            color: #60a5fa;
        }

        .menu-actions {
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .menu-action {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 12px;
            font-size: 14px;
            color: #d1d5db;
            background: transparent;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            text-align: left;
            transition: background-color 0.2s ease, color 0.2s ease;
        }

        .menu-action svg {
            width: 16px;
            height: 16px;
            color: #6b7280;
        }

        .divider {
            height: 1px;
            width: 100%;
            background-color: #374151;
            margin: 4px 0;
        }

        @keyframes fade-in-down {
            from {
                opacity: 0;
                transform: translateY(-6px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;

    render() {
        const open = this.uiState?.state?.layout?.menuOpen ?? false;
        const projectId = this.uiState?.state?.project?.id ?? '';
        const projectName = this.uiState?.state?.project?.name ?? '';
        return html`
            <div>
                <button @click="${(e) => { e.stopPropagation(); dispatchUiEvent(this, 'layout/setMenuOpen', { open: !open }); }}" class="menu-button" title="Menu">
                    <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                ${open ? html`
                    <div class="menu-panel" @click="${(e) => e.stopPropagation()}">
                        <div class="menu-header">
                            <div class="menu-title">
                                <span class="menu-brand">Lit<span>Evaluator</span></span>
                                ${projectId ? html`<span class="menu-id" title="${projectName}">#${projectId.slice(0, 4)}</span>` : nothing}
                            </div>
                        </div>
                        <div class="menu-actions">
                            <button @click="${() => { dispatchUiEvent(this, 'layout/setMenuOpen', { open: false }); dispatchUiEvent(this, 'view/open', { viewId: 'open-library' }); }}" class="menu-action">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                <span>Open Project Library</span>
                            </button>
                            <button @click="${() => { dispatchUiEvent(this, 'layout/setMenuOpen', { open: false }); dispatchUiEvent(this, 'view/open', { viewId: 'project-save' }); }}" class="menu-action">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                                <span>Save Project</span>
                            </button>
                            <div class="divider"></div>
                            <button @click="${() => { dispatchUiEvent(this, 'layout/setMenuOpen', { open: false }); dispatchUiEvent(this, 'view/open', { viewId: 'settings' }); }}" class="menu-action">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.82 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.82 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.82-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.82-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                <span>AI Settings</span>
                            </button>
                        </div>
                    </div>
                ` : nothing}
            </div>
        `;
    }
}
customElements.define('main-menu', AppMainMenu);
