import { LitElement, html, css } from 'lit';
import { createBooleanInputHandlers } from '../../../handlers/shared';

export class AppBooleanInput extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    }
    .toggle {
      width: 24px;
      height: 14px;
      background-color: #4b5563; /* gray-600 */
      border-radius: 9999px;
      position: relative;
      transition: background-color 0.2s;
    }
    :host([checked]) .toggle {
      background-color: #3b82f6;
    }
    .dot {
      width: 10px;
      height: 10px;
      background-color: white;
      border-radius: 50%;
      position: absolute;
      top: 2px;
      left: 2px;
      transition: transform 0.2s;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    }
    :host([checked]) .dot {
      transform: translateX(10px);
    }
  `;

  static properties = { value: { type: Boolean, reflect: true } };

  declare value: boolean;

  private handlers = createBooleanInputHandlers(this);

  constructor() {
    super();
    this.value = false;
    this.addEventListener('click', this.handlers.handleToggle as EventListener);
  }

  protected updated(changed: Map<string, unknown>) {
    if (changed.has('value')) {
      if (this.value) this.setAttribute('checked', '');
      else this.removeAttribute('checked');
    }
  }

  render() {
    return html`<div class="toggle"><div class="dot"></div></div>`;
  }
}

customElements.define('app-boolean-input', AppBooleanInput);
