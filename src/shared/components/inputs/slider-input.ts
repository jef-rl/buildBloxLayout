import { LitElement, html, css } from 'lit';
import { sharedInputStyles } from './shared';
import { createSliderInputHandlers } from '../../../handlers/shared';

export class AppSliderInput extends LitElement {
  static styles = [
    sharedInputStyles,
    css`
      :host {
        gap: 4px;
      }
      input[type='range'] {
        flex: 1;
        border: none;
        padding: 0;
        height: 16px;
      }
      span {
        font-size: 10px;
        color: #9ca3af;
        min-width: 20px;
        font-weight: 300;
      }
    `,
  ];

  static properties = { value: { type: Number }, min: { type: Number }, max: { type: Number } };

  declare value: number;
  declare min: number;
  declare max: number;

  private handlers = createSliderInputHandlers(this);

  constructor() {
    super();
    this.min = 0;
    this.max = 100;
    this.value = 0;
  }

  render() {
    return html`
      <input type="range" .min=${this.min} .max=${this.max} .value=${this.value} @input=${this.handlers.handleInput} />
      <span>${this.value}</span>
    `;
  }
}

customElements.define('app-slider-input', AppSliderInput);
