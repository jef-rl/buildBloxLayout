import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { dispatchUiEvent } from '@project/framework';

type AuthUser = {
  uid: string;
  email?: string;
};

const signInWithEmailAndPassword = async (
  email: string,
  _password: string
): Promise<{ user: AuthUser }> => {
  return {
    user: {
      uid: `demo-${Date.now()}`,
      email
    }
  };
};

@customElement('login-overlay')
export class LoginOverlay extends LitElement {
  @state() private isOpen = true;
  @state() private email = '';
  @state() private password = '';

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      display: block;
      background: rgba(15, 23, 42, 0.65);
      z-index: 1000;
    }

    .panel {
      max-width: 360px;
      margin: 10vh auto 0;
      background: #0f172a;
      border: 1px solid #1f2937;
      border-radius: 12px;
      padding: 24px;
      color: #e2e8f0;
      font-family: 'Inter', sans-serif;
    }

    label {
      display: block;
      font-size: 0.85rem;
      margin-bottom: 6px;
      color: #94a3b8;
    }

    input {
      width: 100%;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid #334155;
      background: #0b1220;
      color: inherit;
      margin-bottom: 14px;
    }

    button {
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 8px;
      background: #3b82f6;
      color: white;
      font-weight: 600;
      cursor: pointer;
    }
  `;

  private async handleSubmit(event: Event) {
    event.preventDefault();
    const credentials = await signInWithEmailAndPassword(this.email, this.password);
    const { uid, email } = credentials.user;
    dispatchUiEvent(window, 'auth/setUser', { user: { uid, email } });
    this.isOpen = false;
  }

  render() {
    if (!this.isOpen) {
      return html``;
    }

    return html`
      <div class="panel">
        <form @submit=${this.handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            .value=${this.email}
            @input=${(event: Event) => {
              this.email = (event.target as HTMLInputElement).value;
            }}
          />
          <label>Password</label>
          <input
            type="password"
            .value=${this.password}
            @input=${(event: Event) => {
              this.password = (event.target as HTMLInputElement).value;
            }}
          />
          <button type="submit">Log in</button>
        </form>
      </div>
    `;
  }
}
