// @ts-nocheck
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { panelStateContext, uiDispatchContext } from '../../core/state/contexts.ts';
import type { PanelId, PanelsState, UiDispatch } from '../../core/state/ui-state.js';

export class AppPanelEditor extends LitElement {
    @property({ type: String }) panelId: PanelId = 'template';
    @property({ type: String }) language = 'html'; // 'html' | 'css'
    @property({ type: String }) placeholder = '';
    @property({ type: String }) aiTitle = '';
    
    // Style props
    @property({ type: String }) textColor = '#dbeafe';

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
            min-width: 200px;
            height: 100%;
            position: relative;
            background-color: #111827;
            border-right: 1px solid #1f2937;
        }

        .ai-action {
            position: absolute;
            top: 8px;
            right: 16px;
            z-index: 10;
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



        .icon {
            width: 14px;
            height: 14px;
        }

        .editor {
            flex: 1;
            position: relative;
        }

        .editor-textarea {
            width: 100%;
            height: 100%;
            padding: 16px 16px 80px;
            background-color: #111827;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 14px;
            border: none;
            resize: none;
            transition: background-color 0.2s ease;
        }

        .editor-textarea:focus {
            outline: none;
            background-color: #0f172a;
        }
    `;

    render() {
        const panelOpen = this.panelsState?.open?.[this.panelId] ?? false;
        if (!panelOpen) return nothing;
        const panelData = this.panelsState?.data?.[this.panelId];
        const value = this.panelId === 'styles'
            ? panelData?.stylesInput ?? ''
            : panelData?.templateInput ?? '';
        return html`
            <div class="panel">
                <!-- AI Button -->
                <div class="ai-action">
                    <button @click="${this.openAi}" class="ai-button" title="${this.aiTitle}">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                    </button>
                </div>
                <div class="editor">
                    <textarea 
                        class="editor-textarea"
                        style="color: ${this.textColor};"
                        .value="${value}"
                        @input="${this.handleInput}"
                        spellcheck="false"
                        placeholder="${this.placeholder}"
                    ></textarea>
                </div>
            </div>
        `;
    }

    private handleInput = (event: Event) => {
        if (!this.dispatch) return;
        const value = (event.target as HTMLTextAreaElement)?.value ?? '';
        if (this.panelId === 'styles') {
            this.dispatch({ type: 'panel/update', panelId: 'styles', data: { stylesInput: value } });
            return;
        }
        this.dispatch({ type: 'panel/update', panelId: 'template', data: { templateInput: value } });
    };

    private openAi = () => {
        if (!this.dispatch) return;
        this.dispatch({ type: 'ai/open', panelId: this.panelId, prompt: '' });
        this.dispatch({ type: 'view/open', viewId: 'ai-prompt', options: { disableCloseWhileGenerating: true } });
    };
}
customElements.define('panel-editor', AppPanelEditor);
