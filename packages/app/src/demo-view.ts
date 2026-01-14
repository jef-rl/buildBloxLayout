import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { uiState } from '@project/framework';

@customElement('demo-view')
export class DemoView extends LitElement {
  @property({ type: Object }) state = uiState.getState();

  constructor() {
    super();
    uiState.subscribe(this.handleStateUpdate.bind(this));
  }

  handleStateUpdate(newState) {
    this.state = newState;
  }

  render() {
    return html`<div>${this.state.message}</div>`;
  }
}
