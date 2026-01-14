// @ts-nocheck
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { panelStateContext } from '../../core/state/contexts.ts';
import type { PanelsState } from '../../core/state/ui-state.js';
import './panel-visual-block';

export class AppPanelPreview extends LitElement {
    @consume({ context: panelStateContext, subscribe: true })
    @property({ attribute: false })
    panelsState?: PanelsState;

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
            background-color: #0b1120;
            border-right: 1px solid #1f2937;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        panel-visual-block {
            flex: 1;
        }
    `;

    render() {
        const panelsState = this.panelsState;
        const open = panelsState?.open?.preview ?? false;
        if (!open) return nothing;
        return html`
            <div class="panel">
                <panel-visual-block mode="preview"></panel-visual-block>
            </div>
        `;
    }
}
customElements.define('panel-preview', AppPanelPreview);
