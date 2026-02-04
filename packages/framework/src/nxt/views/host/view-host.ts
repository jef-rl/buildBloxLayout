import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '../../../domains/workspace/components/PanelView.js';

export class ViewHost extends LitElement {
    @property({ type: String }) panelId: string | null = null;
    @property({ type: String }) viewId: string | null = null;
    @property({ type: String }) viewInstanceId: string | null = null;

    render() {
        return html`
            <panel-view
                .panelId=${this.panelId}
                .viewId=${this.viewId}
                .viewInstanceId=${this.viewInstanceId}
            ></panel-view>
        `;
    }
}

customElements.define('view-host', ViewHost);
