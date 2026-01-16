import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { dispatchUiEvent } from '@project/framework';
import { firebaseAuth, signInWithEmailAndPassword } from '../firebase';

@customElement('login-overlay')
export class LoginOverlay extends LitElement {
  @state() private isOpen = true;
  @state() private email = '';
  @state() private password = '';
  @state() private errorMessage = '';

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

    .error {
      margin-top: 12px;
      color: #fca5a5;
      font-size: 0.85rem;
    }
  `;

  private async handleSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    try {
      const credentials = await signInWithEmailAndPassword(
        firebaseAuth,
        this.email,
        this.password
      );
      const { uid, email } = credentials.user;
      dispatchUiEvent(window, 'auth/setUser', { user: { uid, email } });
      dispatchUiEvent(window, 'layout/setOverlayView', { viewId: null });
      this.isOpen = false;
    } catch (error) {
      console.error('Login failed', error);
      if (error.code === 'auth/wrong-password') {
        this.errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/user-not-found') {
        this.errorMessage = 'User with this email does not exist.';
      } else {
        this.errorMessage = 'Unable to sign in. Please check your details and try again.';
      }
      this.isOpen = true;
    }
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
          ${this.errorMessage ? html`<div class="error">${this.errorMessage}</div>` : ''}
        </form>
      </div>
    `;
  }
}
