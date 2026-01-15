import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { dispatchUiEvent } from '@project/framework';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'demo-project',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? 'demo-app-id'
};

const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

@customElement('login-overlay')
export class LoginOverlay extends LitElement {
  @state() private email = '';
  @state() private password = '';
  @state() private errorMessage: string | null = null;
  @state() private isSubmitting = false;

  static styles = css`
    :host {
      display: block;
      height: 100%;
      width: 100%;
      color: #e5e7eb;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .container {
      height: 100%;
      display: grid;
      place-items: center;
      padding: 2rem;
      background: radial-gradient(circle at top, rgba(59, 130, 246, 0.2), transparent 55%);
    }

    .card {
      width: min(420px, 100%);
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(148, 163, 184, 0.25);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
      display: grid;
      gap: 1.25rem;
    }

    h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #f8fafc;
    }

    p {
      margin: 0;
      color: #cbd5f5;
    }

    label {
      display: grid;
      gap: 0.4rem;
      font-size: 0.85rem;
      color: #cbd5f5;
    }

    input {
      padding: 0.65rem 0.8rem;
      border-radius: 10px;
      border: 1px solid rgba(148, 163, 184, 0.4);
      background: rgba(15, 23, 42, 0.65);
      color: #f8fafc;
      font-size: 0.95rem;
    }

    input:focus {
      outline: 2px solid rgba(56, 189, 248, 0.6);
      border-color: transparent;
    }

    button {
      width: 100%;
      padding: 0.75rem;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #2563eb, #38bdf8);
      color: #f8fafc;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.7;
      transform: none;
      box-shadow: none;
    }

    button:not(:disabled):hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 20px rgba(37, 99, 235, 0.35);
    }

    .error {
      font-size: 0.85rem;
      color: #fca5a5;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-radius: 10px;
      padding: 0.6rem 0.75rem;
    }
  `;

  private handleEmailInput(event: Event) {
    this.email = (event.target as HTMLInputElement).value;
  }

  private handlePasswordInput(event: Event) {
    this.password = (event.target as HTMLInputElement).value;
  }

  private async handleSubmit(event: Event) {
    event.preventDefault();
    if (!this.email || !this.password) {
      this.errorMessage = 'Enter an email and password to continue.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    try {
      await signInWithEmailAndPassword(firebaseAuth, this.email, this.password);
      // View-level actions dispatch through ui-event and are handled in WorkspaceRoot's dispatch pipeline.
      dispatchUiEvent(window, 'layout/setOverlayView', { viewId: null });
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Login failed.';
    } finally {
      this.isSubmitting = false;
    }
  }

  render() {
    return html`
      <div class="container">
        <form class="card" @submit=${this.handleSubmit}>
          <div>
            <h2>Sign in</h2>
            <p>Use your Firebase Auth account to continue.</p>
          </div>

          <label>
            Email
            <input
              type="email"
              name="email"
              autocomplete="email"
              .value=${this.email}
              @input=${this.handleEmailInput}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              autocomplete="current-password"
              .value=${this.password}
              @input=${this.handlePasswordInput}
              required
            />
          </label>

          ${this.errorMessage ? html`<div class="error">${this.errorMessage}</div>` : null}

          <button type="submit" ?disabled=${this.isSubmitting}>
            ${this.isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    `;
  }
}
