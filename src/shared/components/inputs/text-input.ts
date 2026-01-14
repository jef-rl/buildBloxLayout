import { LitElement, html } from 'lit';
import { sharedInputStyles } from './shared';
import { createTextInputHandlers } from '../../../handlers/shared';

export class AppTextInput extends LitElement {
  static styles = sharedInputStyles;
  static properties = { value: { type: String } };

  declare value: string | undefined;

  private handlers = createTextInputHandlers(this);

  render() {
    return html`<input type="text" .value=${this.value || ''} @input=${this.handlers.handleInput} />`;
  }
}

customElements.define('app-text-input', AppTextInput);
