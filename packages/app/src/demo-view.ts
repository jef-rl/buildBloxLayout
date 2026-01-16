import { LitElement, html } from 'lit';
import { ContextConsumer } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import { uiStateContext } from '@project/framework';

@customElement('demo-view')
export class DemoView extends LitElement {
  private uiStateConsumer = new ContextConsumer(this, {
    context: uiStateContext,
    subscribe: true,
  });

  render() {
    const message = this.uiStateConsumer.value?.state?.message;
    return html`<div>${message}</div>`;
  }
}
