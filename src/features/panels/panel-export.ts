// @ts-nocheck
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { createExportPanelHandlers, type ExportPanelHandlers } from '../../handlers/panels';
import { panelStateContext, uiStateContext } from '../../core/state/contexts.ts';
import type { PanelsState, UiStateContextValue } from '../../core/state/ui-state.js';
import { selectGeneratedCode } from '../../handlers/workspace/selectors.ts';

export class AppPanelExport extends LitElement {
    @consume({ context: panelStateContext, subscribe: true })
    @property({ attribute: false })
    panelsState?: PanelsState;

    @consume({ context: uiStateContext, subscribe: true })
    @property({ attribute: false })
    uiState?: UiStateContextValue;

    private exportHandlers: ExportPanelHandlers;

    constructor() {
        super();
        this.exportHandlers = createExportPanelHandlers(this);
    }

    static styles = css`
        :host {
            display: block;
        }

        .panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 300px;
            height: 100%;
            position: relative;
            background-color: #111827;
        }

        .copy-action {
            position: absolute;
            top: 16px;
            right: 16px;
            z-index: 10;
        }

        .copy-button {
            padding: 6px 8px;
            background-color: #1f2937;
            border: 1px solid #374151;
            border-radius: 6px;
            color: #9ca3af;
            cursor: pointer;
            font-size: 12px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            transition: background-color 0.2s ease, color 0.2s ease;
        }



        .icon {
            width: 14px;
            height: 14px;
        }

        .editor {
            flex: 1;
            position: relative;
        }

        .export-textarea {
            width: 100%;
            height: 100%;
            padding: 16px 16px 80px;
            background-color: #111827;
            color: #fef9c3;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 12px;
            line-height: 1.5;
            border: none;
            resize: none;
            transition: background-color 0.2s ease;
        }

        .export-textarea:focus {
            outline: none;
            background-color: #0f172a;
        }
    `;

    render() {
        const open = this.panelsState?.open?.export ?? false;
        if (!open) return nothing;
        const generatedCode = this.uiState?.state ? selectGeneratedCode(this.uiState.state) : '';
        return html`
            <div class="panel">
                <!-- Panel Header with Copy Button -->
                <div class="copy-action">
                    <button 
                        @click="${this.exportHandlers.copyCode}"
                        class="copy-button"
                        title="Copy to Clipboard"
                    >
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        <span>Copy</span>
                    </button>
                </div>
                <div class="editor">
                    <textarea 
                        class="export-textarea"
                        .value="${generatedCode}"
                        readonly
                        spellcheck="false"
                    ></textarea>
                </div>
            </div>
        `;
    }
}
customElements.define('panel-export', AppPanelExport);
