import { LitElement, html, css } from 'lit';
import { sharedInputStyles } from './shared';
import { createColorInputHandlers } from '../../../handlers/shared';

export class AppColorInput extends LitElement {
  static styles = [
    sharedInputStyles,
    css`
      :host {
        gap: 4px;
      }
      input[type='color'] {
        width: 18px;
        height: 18px;
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
      }
      .hex {
        font-family: monospace;
        font-size: 10px;
        color: #9ca3af;
      }
    `,
  ];

  static properties = { value: { type: String } };
  declare value: string;

  private handlers = createColorInputHandlers(this);

  constructor() {
    super();
    this.value = '#000000';
  }

  render() {
    return html`<input type="color" .value=${this.value} @input=${this.handlers.handleInput} /><span class="hex">${this.value}</span>`;
  }
}

customElements.define('app-color-input', AppColorInput);
