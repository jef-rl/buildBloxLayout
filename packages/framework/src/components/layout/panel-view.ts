import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { viewRegistry } from '../../registry/ViewRegistry';

export class PanelView extends LitElement {
    @property({ type: String }) viewId: string | null = null;
    @state() private fallbackMessage: string | null = null;

    static styles = css`
        :host {
            display: block;
            height: 100%;
            width: 100%;
        }

        .view-container {
            height: 100%;
            width: 100%;
        }

        .fallback {
            display: grid;
            place-items: center;
            height: 100%;
            color: #9ca3af;
            font-size: 0.9rem;
        }
    `;

    updated(changedProps: Map<string, unknown>) {
        if (changedProps.has('viewId')) {
            void this.loadView();
        }
    }

    private async loadView() {
        const container = this.shadowRoot?.querySelector('.view-container');
        if (!container) {
            return;
        }

        container.innerHTML = '';
        this.fallbackMessage = null;

        if (!this.viewId) {
            this.fallbackMessage = 'No view selected.';
            return;
        }

        const definition = viewRegistry.get(this.viewId);
        if (!definition) {
            this.fallbackMessage = `View "${this.viewId}" is not registered.`;
            return;
        }

        if (!definition.tag) {
            this.fallbackMessage = `View "${this.viewId}" is missing a tag.`;
            return;
        }

        await viewRegistry.getComponent(this.viewId);
        const element = document.createElement(definition.tag);
        container.appendChild(element);
    }

    render() {
        return html`
            <div class="view-container"></div>
            ${this.fallbackMessage ? html`
                <div class="fallback">
                    <slot>${this.fallbackMessage}</slot>
                </div>
            ` : nothing}
        `;
    }
}

customElements.define('panel-view', PanelView);
