import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { dispatchUiEvent } from '@project/framework';

@customElement('counter-view')
export class CounterView extends LitElement {
  @property({ type: String }) instanceId = '';
  @property({ type: Object }) context: Record<string, any> = {};

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #0f172a;
      color: white;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
    }
    .count {
      font-size: 6rem;
      font-weight: bold;
      margin: 20px 0;
      font-variant-numeric: tabular-nums;
      color: #38bdf8;
    }
    .controls {
      display: flex;
      gap: 16px;
    }
    button {
      background: #334155;
      border: none;
      color: white;
      font-size: 1.5rem;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.2s;
      display: grid;
      place-items: center;
    }
    button:hover {
      background: #475569;
    }
    button:active {
      background: #1e293b;
    }
    .label {
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-size: 0.8rem;
      opacity: 0.7;
    }
  `;

  private updateCount(delta: number) {
    const currentCount = this.context.count ?? 0;
    const newCount = currentCount + delta;
    
    // Update local context via framework
    dispatchUiEvent(this, 'view/updateLocalContext', {
      instanceId: this.instanceId,
      context: { count: newCount }
    });
  }

  render() {
    const count = this.context.count ?? 0;
    
    return html`
      <div class="label">Interactive Counter</div>
      <div class="count">${count}</div>
      <div class="controls">
        <button @click=${() => this.updateCount(-1)}>-</button>
        <button @click=${() => this.updateCount(1)}>+</button>
      </div>
      <div style="margin-top: 20px; font-size: 0.8rem; opacity: 0.5">
        Instance: ${this.instanceId}
      </div>
    `;
  }
}
