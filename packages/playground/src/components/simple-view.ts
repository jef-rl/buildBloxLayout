import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('simple-view')
export class SimpleView extends LitElement {
  @property() label = 'Demo View';
  @property() color = '#eee';

  static styles = css`
    :host {
      display: block;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.1);
    }
    .content {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: monospace;
      font-size: 1.2rem;
      color: #333;
      user-select: none;
    }
  `;

  render() {
    return html`
      <div class="content" style="background-color: ${this.color}">
        ${this.label}
      </div>
    `;
  }
}
