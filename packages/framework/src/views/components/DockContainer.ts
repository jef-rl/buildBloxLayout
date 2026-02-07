import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import type { DockManager } from './DockManager.js';

export class DockContainer extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .dock {
            position: relative;
            display: block;
        }
    `;

    @property({ attribute: false }) manager?: DockManager;
    @property({ type: String }) toolbarId = '';
    @property({ type: String }) fallbackPosition = '';
    @property({ type: Boolean }) disablePositionPicker = false;

    connectedCallback() {
        super.connectedCallback();
        if (this.manager && this.toolbarId) {
            this.manager.register(this.toolbarId);
        }
    }

    disconnectedCallback() {
        if (this.manager && this.toolbarId) {
            this.manager.unregister(this.toolbarId);
        }
        super.disconnectedCallback();
    }

    render() {
        return html`<div class="dock"><slot></slot></div>`;
    }
}

customElements.define('dock-container', DockContainer);
