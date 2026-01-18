import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@project/framework/dist/components/controls/Views.js';

@customElement('app-root')
export class AppRoot extends LitElement {
  render() {
    return html`
      <view-controls></view-controls>
    `;
  }
}
