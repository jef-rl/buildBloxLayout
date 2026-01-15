import { LitElement, html, css } from 'lit';
import { ContextConsumer } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';
import { uiStateContext } from '@project/framework';

@customElement('simple-view')
export class SimpleView extends LitElement {
  @property() label = 'Demo View';
  @property() color = '#eee';
  @property({ type: Object }) data: { label?: string; color?: string } | null = null;

  private uiStateConsumer = new ContextConsumer(this, {
    context: uiStateContext,
    subscribe: true
  });

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
      font-family: monospace;
      font-size: 1.2rem;
      color: #333;
      user-select: none;
    }
    .status {
      margin-top: 0.5rem;
      font-size: 0.9rem;
      opacity: 0.75;
    }
  `;

  render() {
    const label = this.data?.label ?? this.label;
    const color = this.data?.color ?? this.color;
    const auth = this.uiStateConsumer.value?.state?.auth;
    const status = auth?.isLoggedIn ? 'Logged in' : 'Logged out';

    return html`
      <div class="content" style="background-color: ${color}">
        <div>${label}</div>
        <div class="status">${status}</div>
      </div>
    `;
  }
}
