import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('demo-view')
export class DemoView extends LitElement {
  render() {
    return html`<div>Demo View</div>`;
  }
}
