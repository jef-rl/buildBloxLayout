import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import type { ViewInstanceDto } from '../../definitions/dto/view-instance.dto';
import '../host/view-host.js';

export class PanelView extends LitElement {
    static styles = css`
        :host {
            display: block;
            height: 100%;
            width: 100%;
        }
    `;

    @property({ attribute: false }) instance?: ViewInstanceDto;

    render() {
        const instances = this.instance ? [this.instance] : [];
        return html`
            <view-host .instances=${instances}></view-host>
        `;
    }
}

customElements.define('panel-view', PanelView);
