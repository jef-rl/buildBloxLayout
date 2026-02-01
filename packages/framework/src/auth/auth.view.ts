// Main AuthView container
// TODO: Extract from domains/auth/components/AuthView.ts

/**
 * Firebase Authentication View Component
 * Provides email/password login, signup, password reset, and Google OAuth
 */

import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import { dispatchUiEvent } from '../../../utils/dispatcher';
import type { UiStateContextValue } from '../../../state/ui-state';
import type { AuthMode, AuthConfig } from '../../../types/auth';

@customElement('auth-view')
export class AuthView extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .auth-container {
      background: #1f2937;
      border-radius: 8px;
      padding: 24px;
      min-width: 320px;
      max-width: 400px;
      color: #f3f4f6;
    }

    .auth-header {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      text-align: center;
    }

    .form-group {
      margin-bottom: 16px;
    }

    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 6px;
      color: #d1d5db;
    }

    input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #374151;
      border-radius: 6px;
      background: #111827;
      color: #f3f4f6;
      font-size: 14px;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .btn {
      width: 100%;
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-primary:disabled {
      background: #4b5563;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #374151;
      color: #f3f4f6;
      margin-top: 8px;
    }

    .btn-secondary:hover {
      background: #4b5563;
    }

    .btn-google {
      background: white;
      color: #1f2937;
      margin-top: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-google:hover {
      background: #f3f4f6;
    }

    .error {
      background: #7f1d1d;
      color: #fca5a5;
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 13px;
      margin-bottom: 16px;
    }

    .success {
      background: #14532d;
      color: #86efac;
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 13px;
      margin-bottom: 16px;
    }

    .mode-switch {
      text-align: center;
      margin-top: 16px;
      font-size: 13px;
      color: #9ca3af;
    }

    .mode-switch button {
      background: none;
      border: none;
      color: #3b82f6;
      cursor: pointer;
      text-decoration: underline;
      padding: 0;
      font-size: 13px;
    }

    .mode-switch button:hover {
      color: #2563eb;
    }

    .profile-container {
      text-align: center;
    }

    .profile-email {
      font-size: 14px;
      color: #d1d5db;
      margin-bottom: 16px;
    }

    .divider {
      display: flex;
      align-items: center;
      margin: 16px 0;
      color: #6b7280;
      font-size: 12px;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid #374151;
    }

    .divider span {
      padding: 0 12px;
    }
  `;

  @property({ type: Object }) config: AuthConfig = {
    enableEmailAuth: true,
    enableGoogleAuth: true,
    enablePasswordReset: true,
    enableSignup: true,
  };

  @state() private mode: AuthMode = 'login';
  @state() private email = '';
  @state() private password = '';
  @state() private confirmPassword = '';
  @state() private pendingAction: AuthMode | 'google' | 'logout' | null = null;
  @state() private lastSuccess: string | null = null;

  private uiState: UiStateContextValue['state'] | null = null;

  private uiStateConsumer = new ContextConsumer(this, {
    context: uiStateContext,
    subscribe: true,
    callback: (value: UiStateContextValue | undefined) => {
      this.uiState = value?.state ?? null;
      this.requestUpdate();
    },
  });

  connectedCallback() {
    super.connectedCallback();
    console.log('[AuthView] connectedCallback executed');
  }

  private get isAuthenticated(): boolean {
    return this.uiState?.auth?.isLoggedIn ?? false;
  }

  private get authUi() {
    return this.uiState?.authUi ?? { loading: false, error: null, success: null };
  }

  private get currentUser() {
    return this.uiState?.auth?.user ?? null;
  }

  private resetForm() {
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }

  private switchMode(newMode: AuthMode) {
    this.mode = newMode;
    this.resetForm();
    dispatchUiEvent(this, 'auth/setUi', { error: null, success: null });
  }

  private handleLogin(event: Event) {
    event.preventDefault();
    if (!this.email || !this.password) {
      dispatchUiEvent(this, 'auth/setUi', {
        error: 'Please enter email and password',
        success: null,
        loading: false,
      });
      return;
    }
    this.pendingAction = 'login';
    dispatchUiEvent(this, 'auth/loginRequested', {
      email: this.email,
      password: this.password,
    });
  }

  private handleSignup(event: Event) {
    event.preventDefault();
    if (!this.email || !this.password || !this.confirmPassword) {
      dispatchUiEvent(this, 'auth/setUi', {
        error: 'Please fill in all fields',
        success: null,
        loading: false,
      });
      return;
    }

    if (this.password !== this.confirmPassword) {
      dispatchUiEvent(this, 'auth/setUi', {
        error: 'Passwords do not match',
        success: null,
        loading: false,
      });
      return;
    }

    if (this.password.length < 6) {
      dispatchUiEvent(this, 'auth/setUi', {
        error: 'Password must be at least 6 characters',
        success: null,
        loading: false,
      });
      return;
    }
    this.pendingAction = 'signup';
    dispatchUiEvent(this, 'auth/signupRequested', {
      email: this.email,
      password: this.password,
    });
  }

  private handlePasswordReset(event: Event) {
    event.preventDefault();
    if (!this.email) {
      dispatchUiEvent(this, 'auth/setUi', {
        error: 'Please enter your email address',
        success: null,
        loading: false,
      });
      return;
    }
    this.pendingAction = 'reset-password';
    dispatchUiEvent(this, 'auth/passwordResetRequested', { email: this.email });
  }

  private handleGoogleLogin() {
    this.pendingAction = 'google';
    dispatchUiEvent(this, 'auth/googleLoginRequested', {});
  }

  private handleLogout() {
    this.pendingAction = 'logout';
    dispatchUiEvent(this, 'auth/logoutRequested', {});
  }

  protected updated() {
    const success = this.authUi.success;
    if (success && success !== this.lastSuccess) {
      this.lastSuccess = success;
      if (this.pendingAction === 'signup') {
        setTimeout(() => this.switchMode('login'), 1500);
      }
      if (this.pendingAction === 'reset-password') {
        setTimeout(() => this.switchMode('login'), 3000);
      }
      this.pendingAction = null;
    }
    if (this.authUi.error) {
      this.pendingAction = null;
    }
  }

  private renderLoginForm() {
    return html`
      <form @submit=${this.handleLogin}>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            .value=${this.email}
            @input=${(e: InputEvent) => (this.email = (e.target as HTMLInputElement).value)}
            ?disabled=${this.authUi.loading}
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            .value=${this.password}
            @input=${(e: InputEvent) => (this.password = (e.target as HTMLInputElement).value)}
            ?disabled=${this.authUi.loading}
            required
          />
        </div>

        <button type="submit" class="btn btn-primary" ?disabled=${this.authUi.loading}>
          ${this.authUi.loading ? 'Signing in...' : 'Sign In'}
        </button>

        ${this.config.enableGoogleAuth
          ? html`
              <div class="divider">
                <span>OR</span>
              </div>
              <button
                type="button"
                class="btn btn-google"
                @click=${this.handleGoogleLogin}
                ?disabled=${this.authUi.loading}
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"
                  />
                  <path
                    fill="#EA4335"
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                  />
                </svg>
                Sign in with Google
              </button>
            `
          : ''}

        ${this.config.enablePasswordReset
          ? html`
              <div class="mode-switch">
                <button type="button" @click=${() => this.switchMode('reset-password')}>
                  Forgot password?
                </button>
              </div>
            `
          : ''}

        ${this.config.enableSignup
          ? html`
              <div class="mode-switch">
                Don't have an account?
                <button type="button" @click=${() => this.switchMode('signup')}>
                  Sign up
                </button>
              </div>
            `
          : ''}
      </form>
    `;
  }

  private renderSignupForm() {
    return html`
      <form @submit=${this.handleSignup}>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            .value=${this.email}
            @input=${(e: InputEvent) => (this.email = (e.target as HTMLInputElement).value)}
                ?disabled=${this.authUi.loading}
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            .value=${this.password}
            @input=${(e: InputEvent) => (this.password = (e.target as HTMLInputElement).value)}
            ?disabled=${this.authUi.loading}
            minlength="6"
            required
          />
        </div>

        <div class="form-group">
          <label for="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            type="password"
            .value=${this.confirmPassword}
            @input=${(e: InputEvent) => (this.confirmPassword = (e.target as HTMLInputElement).value)}
            ?disabled=${this.authUi.loading}
            required
          />
        </div>

        <button type="submit" class="btn btn-primary" ?disabled=${this.authUi.loading}>
          ${this.authUi.loading ? 'Creating account...' : 'Create Account'}
        </button>

        <div class="mode-switch">
          Already have an account?
          <button type="button" @click=${() => this.switchMode('login')}>
            Sign in
          </button>
        </div>
      </form>
    `;
  }

  private renderPasswordResetForm() {
    return html`
      <form @submit=${this.handlePasswordReset}>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            .value=${this.email}
            @input=${(e: InputEvent) => (this.email = (e.target as HTMLInputElement).value)}
            ?disabled=${this.authUi.loading}
            required
          />
        </div>

        <button type="submit" class="btn btn-primary" ?disabled=${this.authUi.loading}>
          ${this.authUi.loading ? 'Sending...' : 'Send Reset Email'}
        </button>

        <div class="mode-switch">
          <button type="button" @click=${() => this.switchMode('login')}>
            Back to sign in
          </button>
        </div>
      </form>
    `;
  }

  private renderProfile() {
    return html`
      <div class="profile-container">
        <div class="auth-header">Profile</div>
        <div class="profile-email">${this.currentUser?.email ?? 'No email'}</div>
        <button class="btn btn-secondary" @click=${this.handleLogout} ?disabled=${this.authUi.loading}>
          ${this.authUi.loading ? 'Logging out...' : 'Sign Out'}
        </button>
      </div>
    `;
  }

  render() {
    if (this.isAuthenticated && this.mode !== 'profile') {
      this.mode = 'profile';
    }
    if (!this.isAuthenticated && this.mode === 'profile') {
      this.mode = 'login';
    }

    let header = 'Sign In';
    let content;

    if (this.mode === 'login') {
      header = 'Sign In';
      content = this.renderLoginForm();
    } else if (this.mode === 'signup') {
      header = 'Create Account';
      content = this.renderSignupForm();
    } else if (this.mode === 'reset-password') {
      header = 'Reset Password';
      content = this.renderPasswordResetForm();
    } else if (this.mode === 'profile') {
      content = this.renderProfile();
    }

    return html`
      <div class="auth-container">
        ${this.mode !== 'profile' ? html`<div class="auth-header">${header}</div>` : ''}
        ${this.authUi.error ? html`<div class="error">${this.authUi.error}</div>` : ''}
        ${this.authUi.success ? html`<div class="success">${this.authUi.success}</div>` : ''}
        ${content}
      </div>
    `;
  }
}
