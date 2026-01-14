import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { uiState } from '@project/framework';

@customElement('app-root')
export class AppRoot extends LitElement {
  @property({ type: Object }) state = uiState.getState();

  constructor() {
    super();
    uiState.subscribe(this.handleStateUpdate.bind(this));
  }

  handleStateUpdate(newState) {
    this.state = newState;
  }

  render() {
    return html`
      <button @click=${() => uiState.update({ message: 'Hello from the framework!' })}>Update State</button>
      <pre>${JSON.stringify(this.state, null, 2)}</pre>
    `;
  }
}
