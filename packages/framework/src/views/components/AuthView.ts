/**
 * Firebase Authentication View Component
 * Provides email/password login, signup, password reset, and Google OAuth
 */

import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import type { CoreContext } from '../../runtime/context/core-context';
import { coreContext } from '../../runtime/context/core-context-key';
import { authStateSelectorKey } from '../../selectors/auth/auth-state.selector';
import { authUiSelectorKey } from '../../selectors/auth/auth-ui.selector';
import type { AuthMode, AuthConfig } from '../../types/auth';
import type { UIState } from '../../types/state';
import { ActionCatalog } from '../../runtime/actions/action-catalog';
import { logInfo } from '../../runtime/engine/logging/framework-logger';

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

    .auth-subheader {
      font-size: 14px;
      color: #9ca3af;
      margin-bottom: 24px;
      text-align: center;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      margin-bottom: 6px;
      font-size: 12px;
      color: #9ca3af;
    }

    .form-input {
      width: 100%;
      padding: 10px 12px;
      border-radius: 6px;
      border: 1px solid #374151;
      background: #374151;
      color: #f3f4f6;
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: #60a5fa;
    }

    .auth-button {
      width: 100%;
      padding: 12px;
      border-radius: 6px;
      border: none;
      background: #2563eb;
      color: white;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 8px;
    }

    .auth-button:hover {
      background: #1d4ed8;
    }

    .auth-button:disabled {
      background: #4b5563;
      cursor: not-allowed;
    }

    .auth-link {
      display: block;
      text-align: center;
      margin-top: 16px;
      color: #60a5fa;
      cursor: pointer;
      font-size: 14px;
    }

    .auth-divider {
      display: flex;
      align-items: center;
      margin: 20px 0;
      color: #6b7280;
      font-size: 12px;
    }

    .auth-divider::before,
    .auth-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #374151;
    }

    .auth-divider::before {
      margin-right: 12px;
    }

    .auth-divider::after {
      margin-left: 12px;
    }

    .google-button {
      width: 100%;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #374151;
      background: transparent;
      color: #f3f4f6;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .google-button:hover {
      background: #374151;
    }

    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid #ef4444;
      color: #ef4444;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 13px;
    }

    .success-message {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid #22c55e;
      color: #22c55e;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 13px;
    }
  `;

  @property({ type: Object })
  config?: AuthConfig;

  @state() private mode: AuthMode = 'login';
  @state() private email = '';
  @state() private password = '';
  @state() private confirmPassword = '';
  @state() private displayName = '';
  @state() private errorMessage = '';
  @state() private successMessage = '';
  @state() private isLoading = false;
  @state() private allowSignup = true;
  @state() private allowGoogleSignIn = true;
  @state() private showResetPassword = true;
  @state() private resetEmailSent = false;
  @state() private oauthProviders: string[] = [];
  @state() private hasCheckedConfig = false;
  @state() private authEnabled = false;

  private core: CoreContext<UIState> | null = null;

  private _consumer = new ContextConsumer(this, {
    context: coreContext,
    subscribe: true,
    callback: (value: CoreContext<UIState> | undefined) => {
      this.core = value ?? null;
      this.refreshFromState();
    },
  });

  private refreshFromState() {
    if (!this.core) {
      return;
    }
    const authState = this.core.select(authStateSelectorKey);
    const authUi = this.core.select(authUiSelectorKey);

    this.authEnabled = authState.enabled;
    this.allowSignup = authUi.allowSignup;
    this.allowGoogleSignIn = authUi.allowGoogleSignIn;
    this.showResetPassword = authUi.allowPasswordReset;
    this.oauthProviders = authUi.oauthProviders;

    if (authState.currentUser) {
      this.email = authState.currentUser.email || '';
      this.displayName = authState.currentUser.displayName || '';
      this.successMessage = 'You are already signed in.';
    }

    if (!this.hasCheckedConfig && authState.configChecked) {
      this.hasCheckedConfig = true;
      if (!authState.enabled) {
        this.errorMessage = 'Authentication is not configured. Please provide Firebase configuration.';
      }
    }

    this.requestUpdate();
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private switchMode(newMode: AuthMode) {
    this.clearMessages();
    this.mode = newMode;
    this.resetEmailSent = false;
  }

  private async handleLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.core?.dispatch({
      action: ActionCatalog.AuthLogin,
      payload: { email: this.email, password: this.password },
    });
  }

  private async handleSignup() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.core?.dispatch({
      action: ActionCatalog.AuthSignup,
      payload: { email: this.email, password: this.password, displayName: this.displayName },
    });
  }

  private async handleResetPassword() {
    if (!this.email) {
      this.errorMessage = 'Please enter your email.';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.core?.dispatch({
      action: ActionCatalog.AuthResetPassword,
      payload: { email: this.email },
    });

    this.resetEmailSent = true;
  }

  private async handleGoogleSignIn() {
    this.isLoading = true;
    this.clearMessages();

    this.core?.dispatch({
      action: ActionCatalog.AuthSignInWithPopup,
      payload: { provider: 'google' },
    });
  }

  private async handleLogout() {
    this.isLoading = true;
    this.clearMessages();

    this.core?.dispatch({
      action: ActionCatalog.AuthLogout,
      payload: {},
    });
  }

  private handleConfigSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const config = {
      apiKey: formData.get('apiKey') as string,
      authDomain: formData.get('authDomain') as string,
      projectId: formData.get('projectId') as string,
      storageBucket: formData.get('storageBucket') as string,
      messagingSenderId: formData.get('messagingSenderId') as string,
      appId: formData.get('appId') as string,
      measurementId: formData.get('measurementId') as string,
    };

    this.core?.dispatch({
      action: ActionCatalog.AuthConfigure,
      payload: { config },
    });
  }

  private renderConfigForm() {
    return html`
      <div class="auth-container">
        <div class="auth-header">Configure Authentication</div>
        <div class="auth-subheader">
          Please enter your Firebase configuration to enable authentication.
        </div>
        <form @submit=${this.handleConfigSubmit}>
          <div class="form-group">
            <label class="form-label">API Key</label>
            <input class="form-input" type="text" name="apiKey" required />
          </div>
          <div class="form-group">
            <label class="form-label">Auth Domain</label>
            <input class="form-input" type="text" name="authDomain" required />
          </div>
          <div class="form-group">
            <label class="form-label">Project ID</label>
            <input class="form-input" type="text" name="projectId" required />
          </div>
          <div class="form-group">
            <label class="form-label">Storage Bucket</label>
            <input class="form-input" type="text" name="storageBucket" required />
          </div>
          <div class="form-group">
            <label class="form-label">Messaging Sender ID</label>
            <input class="form-input" type="text" name="messagingSenderId" required />
          </div>
          <div class="form-group">
            <label class="form-label">App ID</label>
            <input class="form-input" type="text" name="appId" required />
          </div>
          <div class="form-group">
            <label class="form-label">Measurement ID</label>
            <input class="form-input" type="text" name="measurementId" />
          </div>
          <button class="auth-button" type="submit">Save Configuration</button>
        </form>
      </div>
    `;
  }

  private renderLoggedInView() {
    return html`
      <div class="auth-container">
        <div class="auth-header">Welcome back!</div>
        <div class="auth-subheader">You're currently signed in as:</div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-input" type="email" .value=${this.email} disabled />
        </div>
        ${this.displayName ? html`
          <div class="form-group">
            <label class="form-label">Display Name</label>
            <input class="form-input" type="text" .value=${this.displayName} disabled />
          </div>
        ` : ''}
        <button class="auth-button" @click=${this.handleLogout}>Sign Out</button>
      </div>
    `;
  }

  private renderLoginView() {
    return html`
      <div class="auth-container">
        <div class="auth-header">Sign In</div>
        <div class="auth-subheader">Welcome back! Please enter your details.</div>
        ${this.errorMessage ? html`<div class="error-message">${this.errorMessage}</div>` : ''}
        ${this.successMessage ? html`<div class="success-message">${this.successMessage}</div>` : ''}
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            class="form-input"
            type="email"
            .value=${this.email}
            @input=${(e: Event) => this.email = (e.target as HTMLInputElement).value}
          />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            class="form-input"
            type="password"
            .value=${this.password}
            @input=${(e: Event) => this.password = (e.target as HTMLInputElement).value}
          />
        </div>
        <button class="auth-button" @click=${this.handleLogin} ?disabled=${this.isLoading}>
          ${this.isLoading ? 'Signing in...' : 'Sign In'}
        </button>
        ${this.allowGoogleSignIn ? html`
          <div class="auth-divider">Or continue with</div>
          <button class="google-button" @click=${this.handleGoogleSignIn} ?disabled=${this.isLoading}>
            Continue with Google
          </button>
        ` : ''}
        ${this.showResetPassword ? html`
          <div class="auth-link" @click=${() => this.switchMode('reset')}>
            Forgot password?
          </div>
        ` : ''}
        ${this.allowSignup ? html`
          <div class="auth-link" @click=${() => this.switchMode('signup')}>
            Don't have an account? Sign up
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderSignupView() {
    return html`
      <div class="auth-container">
        <div class="auth-header">Create Account</div>
        <div class="auth-subheader">Join us and start building.</div>
        ${this.errorMessage ? html`<div class="error-message">${this.errorMessage}</div>` : ''}
        ${this.successMessage ? html`<div class="success-message">${this.successMessage}</div>` : ''}
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input
            class="form-input"
            type="text"
            .value=${this.displayName}
            @input=${(e: Event) => this.displayName = (e.target as HTMLInputElement).value}
          />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            class="form-input"
            type="email"
            .value=${this.email}
            @input=${(e: Event) => this.email = (e.target as HTMLInputElement).value}
          />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            class="form-input"
            type="password"
            .value=${this.password}
            @input=${(e: Event) => this.password = (e.target as HTMLInputElement).value}
          />
        </div>
        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input
            class="form-input"
            type="password"
            .value=${this.confirmPassword}
            @input=${(e: Event) => this.confirmPassword = (e.target as HTMLInputElement).value}
          />
        </div>
        <button class="auth-button" @click=${this.handleSignup} ?disabled=${this.isLoading}>
          ${this.isLoading ? 'Creating account...' : 'Create Account'}
        </button>
        ${this.allowGoogleSignIn ? html`
          <div class="auth-divider">Or sign up with</div>
          <button class="google-button" @click=${this.handleGoogleSignIn} ?disabled=${this.isLoading}>
            Sign up with Google
          </button>
        ` : ''}
        <div class="auth-link" @click=${() => this.switchMode('login')}>
          Already have an account? Sign in
        </div>
      </div>
    `;
  }

  private renderResetView() {
    return html`
      <div class="auth-container">
        <div class="auth-header">Reset Password</div>
        <div class="auth-subheader">We'll send you a reset link.</div>
        ${this.errorMessage ? html`<div class="error-message">${this.errorMessage}</div>` : ''}
        ${this.successMessage ? html`<div class="success-message">${this.successMessage}</div>` : ''}
        ${this.resetEmailSent ? html`
          <div class="success-message">Password reset email sent! Check your inbox.</div>
        ` : ''}
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            class="form-input"
            type="email"
            .value=${this.email}
            @input=${(e: Event) => this.email = (e.target as HTMLInputElement).value}
          />
        </div>
        <button class="auth-button" @click=${this.handleResetPassword} ?disabled=${this.isLoading}>
          ${this.isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <div class="auth-link" @click=${() => this.switchMode('login')}>
          Back to sign in
        </div>
      </div>
    `;
  }

  protected updated() {
    if (this.core && !this.authEnabled) {
      logInfo('Authentication is not enabled');
    }
  }

  render() {
    if (!this.authEnabled) {
      return this.renderConfigForm();
    }

    const authState = this.core?.select(authStateSelectorKey);
    if (authState?.currentUser) {
      return this.renderLoggedInView();
    }

    if (this.mode === 'login') {
      return this.renderLoginView();
    }
    if (this.mode === 'signup') {
      return this.renderSignupView();
    }
    if (this.mode === 'reset') {
      return this.renderResetView();
    }

    return html`<div class="auth-container">Loading...</div>`;
  }
}
