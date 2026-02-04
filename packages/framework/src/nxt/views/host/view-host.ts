import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '../../../domains/workspace/components/PanelView.js';

export class ViewHost extends LitElement {
    private static readonly elementCache = new Map<string, HTMLElement>();

    static getElement(instanceId: string): HTMLElement | undefined {
        return ViewHost.elementCache.get(instanceId);
    }

    static setElement(instanceId: string, element: HTMLElement): void {
        ViewHost.elementCache.set(instanceId, element);
    }

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
