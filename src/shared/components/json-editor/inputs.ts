import { LitElement, css, html } from 'lit';

const sharedInputStyles = css`
  :host {
    display: inline-flex;
    align-items: center;
    width: 100%;
  }
  input {
    font-family: inherit;
    font-size: 12px;
    font-weight: 300;
    padding: 1px 0;
    border: none;
    border-bottom: 1px solid transparent;
    border-radius: 0;
    background: transparent;
    color: #d1d5db; /* gray-300 */
    transition: border-color 0.15s;
    width: 100%;
    height: 20px;
    box-sizing: border-box;
    line-height: 1;
  }
  input:focus {
    outline: none;
    border-bottom: 1px solid #3b82f6; /* blue-500 */
  }
`;

export class AppTextInput extends LitElement {
  static styles = sharedInputStyles;
  static properties = { value: { type: String } };

  declare value: string;

  private onInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    this.dispatchEvent(new CustomEvent<string>('value-change', { detail: val, bubbles: true, composed: true }));
  }

  render() {
    return html`<input type="text" .value=${this.value ?? ''} @input=${this.onInput} />`;
  }
}
customElements.define('app-text-input', AppTextInput);

export class AppNumberInput extends LitElement {
  static styles = sharedInputStyles;
  static properties = { value: { type: Number } };
  declare value: number;

  private onInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value;
    const val = Number(raw);
    if (!Number.isNaN(val)) {
      this.dispatchEvent(new CustomEvent<number>('value-change', { detail: val, bubbles: true, composed: true }));
    }
  }

  render() {
    return html`<input type="number" .value=${String(this.value ?? 0)} @input=${this.onInput} />`;
  }
}
customElements.define('app-number-input', AppNumberInput);

export class AppSliderInput extends LitElement {
  static styles = [
    sharedInputStyles,
    css`
      :host {
        gap: 6px;
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
        min-width: 22px;
        font-weight: 300;
      }
    `,
  ];

  static properties = { value: { type: Number }, min: { type: Number }, max: { type: Number } };

  declare value: number;
  declare min: number;
  declare max: number;

  constructor() {
    super();
    this.min = 0;
    this.max = 100;
    this.value = 0;
  }

  private onInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value;
    const val = Number(raw);
    if (!Number.isNaN(val)) {
      this.dispatchEvent(new CustomEvent<number>('value-change', { detail: val, bubbles: true, composed: true }));
    }
  }

  render() {
    return html`
      <input
        type="range"
        .value=${String(this.value ?? 0)}
        min=${String(this.min ?? 0)}
        max=${String(this.max ?? 100)}
        @input=${this.onInput}
      />
      <span>${this.value}</span>
    `;
  }
}
customElements.define('app-slider-input', AppSliderInput);


export class AppColorInput extends LitElement {
  static styles = [
    sharedInputStyles,
    css`
      :host { gap: 6px; }
      input[type='color']{
        width: 18px;
        height: 18px;
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
      }
      .hex{ font-family: Menlo, Monaco, 'Courier New', monospace; font-size: 10px; color: #9ca3af; }
    `
  ];
  static properties = { value: { type: String } };
  declare value: string;

  private onInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    this.dispatchEvent(new CustomEvent<string>('value-change', { detail: val, bubbles: true, composed: true }));
  }

  render() {
    return html`<input type="color" .value=${this.value ?? '#000000'} @input=${this.onInput} /><span class="hex">${this.value}</span>`;
  }
}
customElements.define('app-color-input', AppColorInput);

export class AppBooleanInput extends LitElement {
  static styles = css`
    :host{ display:inline-flex; align-items:center; cursor:pointer; }
    .toggle{
      width: 28px;
      height: 16px;
      background: #4b5563;
      border-radius: 9999px;
      position: relative;
      transition: background-color 0.2s;
      border: 1px solid rgba(255,255,255,0.10);
    }
    :host([checked]) .toggle{ background:#3b82f6; }
    .dot{
      width: 12px;
      height: 12px;
      background:white;
      border-radius:50%;
      position:absolute;
      top: 1px;
      left: 1px;
      transition: transform 0.2s;
      box-shadow: 0 1px 2px rgba(0,0,0,0.25);
    }
    :host([checked]) .dot{ transform: translateX(12px); }
  `;
  static properties = { value: { type: Boolean, reflect: true } };
  declare value: boolean;

  constructor() {
    super();
    this.value = false;
    this.addEventListener('click', () => this.toggle());
  }

  protected updated(changed: Map<string, unknown>) {
    if (changed.has('value')) {
      if (this.value) this.setAttribute('checked', '');
      else this.removeAttribute('checked');
    }
  }

  private toggle() {
    this.dispatchEvent(new CustomEvent<boolean>('value-change', { detail: !this.value, bubbles: true, composed: true }));
  }

  render() {
    return html`<div class="toggle"><div class="dot"></div></div>`;
  }
}
customElements.define('app-boolean-input', AppBooleanInput);
