import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { dispatchUiEvent } from '@project/framework';

@customElement('simple-view')
export class SimpleView extends LitElement {
  @property() label = 'Demo View';
  @property() color = '#eee';
  @property({ type: Object }) data: { label?: string; color?: string } | null = null;

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
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      font-family: monospace;
      font-size: 1.2rem;
      color: #333;
      user-select: none;
    }
    button {
      border: none;
      border-radius: 999px;
      padding: 0.5rem 1.1rem;
      font-size: 0.9rem;
      cursor: pointer;
      background: rgba(15, 23, 42, 0.85);
      color: #f8fafc;
    }
    button:hover {
      background: rgba(30, 41, 59, 0.9);
    }
  `;

  private openLoginOverlay() {
    // View-level actions dispatch ui-event messages handled by WorkspaceRoot's dispatch pipeline.
    dispatchUiEvent(window, 'layout/setOverlayView', { viewId: 'login-view' });
  }

  render() {
    const label = this.data?.label ?? this.label;
    const color = this.data?.color ?? this.color;

    return html`
      <div class="content" style="background-color: ${color}">
        <div>${label}</div>
        <button type="button" @click=${this.openLoginOverlay}>Open login overlay</button>
      </div>
    `;
  }
}
