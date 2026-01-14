import { LitElement, html } from 'lit';
import { sharedInputStyles } from './shared';
import { createNumberInputHandlers } from '../../../handlers/shared';

export class AppNumberInput extends LitElement {
  static styles = sharedInputStyles;
  static properties = { value: { type: Number } };

  declare value: number | undefined;

  private handlers = createNumberInputHandlers(this);

  render() {
    return html`<input type="number" .value=${this.value ?? 0} @input=${this.handlers.handleInput} />`;
  }
}

customElements.define('app-number-input', AppNumberInput);
