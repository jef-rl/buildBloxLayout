import { LitElement, html } from 'lit';
import { ContextConsumer } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import { uiStateContext } from '@project/framework';

@customElement('app-root')
export class AppRoot extends LitElement {
  private uiStateConsumer = new ContextConsumer(this, {
    context: uiStateContext,
    subscribe: true,
  });

  render() {
    const state = this.uiStateConsumer.value?.state;
    return html`
      <button
        @click=${() =>
          this.uiStateConsumer.value?.dispatch?.({
            type: 'context/update',
            path: 'message',
            value: 'Hello from the framework!',
          })}
      >
        Update State
      </button>
      <pre>${JSON.stringify(state, null, 2)}</pre>
    `;
  }
}
