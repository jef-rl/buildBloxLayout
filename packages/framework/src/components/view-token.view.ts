import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('view-token')
export class ViewToken extends LitElement {
  @property({ type: String }) viewId = '';
  @property({ type: String }) label = '';
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ type: Boolean, reflect: true }) isSlot = false;
  @property({ type: Number }) slotIndex?: number;

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: grab;
      user-select: none;
      transition: background-color 0.2s, color 0.2s;
      border: 1px solid #555;
      font-size: 12px;
      min-width: 30px;
      text-align: center;
    }

    :host([active]) {
      background-color: #4caf50; /* Green */
      color: white;
      border-color: #4caf50;
    }

    :host(:not([active])) {
      background-color: #444;
      color: #ccc;
    }

    :host([isSlot]:not([active])) {
        background-color: #666;
        color: #aaa;
    }

    .slot-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: #333;
      color: white;
      font-weight: bold;
      margin-right: 6px;
      font-size: 10px;
    }

    :host([active]) .slot-number {
        background-color: white;
        color: #4caf50;
    }
  `;

  constructor() {
    super();
    this.draggable = true;
    this.addEventListener('dragstart', this.handleDragStart);
  }

  private handleDragStart(e: DragEvent) {
    if (this.viewId) {
      e.dataTransfer?.setData('text/plain', this.viewId);
    } else {
      e.preventDefault();
    }
  }

  render() {
    const classes = {
        token: true,
        active: this.active,
        slot: this.isSlot
    };

    return html`
      <div class=${classMap(classes)}>
        ${this.slotIndex !== undefined ? html`<span class="slot-number">${this.slotIndex + 1}</span>` : ''}
        <span>${this.label}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'view-token': ViewToken;
  }
}
