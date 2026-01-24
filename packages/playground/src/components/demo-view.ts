import { LitElement, html, css } from 'lit';
import { ContextConsumer } from '@lit/context';
import { customElement, property, state } from 'lit/decorators.js';
import { uiStateContext, dispatchUiEvent, type UiStateContextValue } from '@project/framework';

/**
 * Improved Demo View Component
 * 
 * This component demonstrates:
 * 1. Proper context consumption without mutation
 * 2. Event-driven state updates via dispatchUiEvent
 * 3. Reactive UI based on context changes
 * 4. Clean separation of concerns
 */
@customElement('demo-view')
export class ImprovedDemoView extends LitElement {
  // ====================
  // PROPERTIES
  // ====================

  /** View label from view definition */
  @property() label = 'Demo View';

  /** Background color for the view */
  @property() color = '#1e40af';

  /** View description */
  @property() description = '';

  /** Data passed from panel */
  @property({ type: Object }) data: {
    label?: string;
    color?: string;
    description?: string;
  } | null = null;

  // ====================
  // INTERNAL STATE
  // ====================

  /** Local interaction state */
  @state() private isHovered = false;

  /** Context consumer - READ ONLY */
  private uiState: UiStateContextValue['state'] | null = null;
  private uiDispatch: UiStateContextValue['dispatch'] | null = null;

  private uiStateConsumer = new ContextConsumer(this, {
    context: uiStateContext,
    subscribe: true,
    callback: (value: UiStateContextValue | undefined) => {
      // Store state reference but NEVER mutate it
      this.uiState = value?.state ?? null;
      this.uiDispatch = value?.dispatch ?? null;
      this.requestUpdate();
    },
  });

  // ====================
  // STYLES
  // ====================

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;
      position: relative;
    }

    .view-container {
    display: grid;
    height: 100%;
    transition: transform 0.2s ease;
    width: 100%;
    overflow: auto;
    }

    .view-container:hover {
      transform: scale(1.01);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .title {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: white;
      margin: 0;
    }

    .description {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 12px;
      background: rgba(0, 0, 0, 0.3);
      font-size: 0.75rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
    }

    .status-indicator.logged-out {
      background: #ef4444;
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow-y: auto;
    }

    .info-card {
      padding: 16px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .info-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 8px;
    }

    .info-value {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.9);
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    }

    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .btn-primary {
      background: rgba(59, 130, 246, 0.8);
      color: white;
    }

    .btn-primary:hover {
      background: rgba(59, 130, 246, 1);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.9);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .expansion-status {
      display: flex;
      gap: 12px;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .expansion-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .expansion-icon {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .expansion-icon.active {
      background: #10b981;
    }

    .expansion-icon.inactive {
      background: #6b7280;
    }

    .demo-section {
      padding: 16px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.15);
      border-left: 3px solid rgba(59, 130, 246, 0.5);
    }

    .demo-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 8px;
    }

    .demo-text {
      font-size: 0.8125rem;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.7);
    }

    code {
      padding: 2px 6px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.3);
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 0.75rem;
      color: #60a5fa;
    }
  `;

  // ====================
  // COMPUTED PROPERTIES
  // ====================

  private get viewLabel() {
    return this.data?.label ?? this.label;
  }

  private get viewColor() {
    return this.data?.color ?? this.color;
  }

  private get viewDescription() {
    return this.data?.description ?? this.description;
  }

  private get authStatus() {
    const auth = this.uiState?.auth;
    return {
      isLoggedIn: auth?.isLoggedIn ?? false,
      userEmail: auth?.user?.email ?? 'Guest'
    };
  }

  private get layoutState() {
    const layout = this.uiState?.layout;
    return {
      viewportMode: layout?.viewportWidthMode ?? 'auto',
      mainAreaCount: layout?.mainAreaCount ?? 1,
      overlayView: layout?.overlayView ?? null,
      expansion: {
        left: layout?.expansion?.expanderLeft ?? 'Closed',
        right: layout?.expansion?.expanderRight ?? 'Closed',
        bottom: layout?.expansion?.expanderBottom ?? 'Closed'
      }
    };
  }

  private get panelInfo() {
    const panels = this.uiState?.panels ?? [];
    const mainPanels = panels.filter(p => p.region === 'main');
    const activePanels = mainPanels.filter(p => p.view !== null);

    return {
      total: panels.length,
      main: mainPanels.length,
      active: activePanels.length
    };
  }

  // ====================
  // EVENT HANDLERS (Dispatch Only)
  // ====================

  /**
   * Toggle expansion panel
   * CORRECT: Dispatches event to handler
   * INCORRECT: Would be direct state mutation
   */
  private toggleExpansion(side: 'left' | 'right' | 'bottom') {
    const currentState = this.layoutState.expansion[side];

    // Dispatch event through the framework's event system
    dispatchUiEvent(this, 'layout/setExpansion', {
      side,
      expanded: !currentState
    });
  }

  /**
   * Change viewport mode
   * Demonstrates proper action dispatch pattern
   */
  private changeViewportMode(mode: string) {
    dispatchUiEvent(this, 'layout/setViewportWidthMode', {
      mode
    });
  }

  /**
   * Open overlay
   * Shows how to trigger overlay views
   */
  private openSettings() {
    dispatchUiEvent(this, 'layout/setOverlayView', {
      viewId: 'project-settings'
    });
  }

  /**
   * Simulate login
   * Demonstrates auth state updates
   */
  private simulateLogin() {
    dispatchUiEvent(this, 'auth/setUser', {
      user: {
        uid: 'demo-user-' + Date.now(),
        email: 'demo@example.com'
      }
    });
  }

  /**
   * Simulate logout
   */
  private simulateLogout() {
    dispatchUiEvent(this, 'auth/setUser', {
      user: null
    });
  }

  // ====================
  // RENDER
  // ====================

  render() {
    const auth = this.authStatus;
    const layout = this.layoutState;
    const panelInfo = this.panelInfo;

    return html`
      <div 
        class="view-container" 
        style="background-color: ${this.viewColor}"
        @mouseenter=${() => this.isHovered = true}
        @mouseleave=${() => this.isHovered = false}
      >
        <div class="header">
          <div>
            <h2 class="title">${this.viewLabel}</h2>
            <p class="description">${this.viewDescription}</p>
          </div>
          <div class="status-badge">
            <span class="status-indicator ${auth.isLoggedIn ? '' : 'logged-out'}"></span>
            ${auth.isLoggedIn ? 'Logged In' : 'Logged Out'}
          </div>
        </div>

        <div class="content">
          <!-- Context State Display -->
          <div class="info-card">
            <div class="info-label">Authentication</div>
            <div class="info-value">
              ${auth.isLoggedIn ? `User: ${auth.userEmail}` : 'Guest User'}
            </div>
          </div>

          <div class="info-card">
            <div class="info-label">Layout Configuration</div>
            <div class="info-value">
              Mode: ${layout.viewportMode} | Panels: ${layout.mainAreaCount} | Overlay: ${layout.overlayView ?? 'None'}
            </div>
          </div>

          <div class="info-card">
            <div class="info-label">Panel Status</div>
            <div class="info-value">
              Total: ${panelInfo.total} | Main: ${panelInfo.main} | Active: ${panelInfo.active}
            </div>
          </div>

          <!-- Expansion Panel Status -->
          <div class="info-card">
            <div class="info-label">Expansion Panels</div>
            <div class="expansion-status">
              <div class="expansion-item">
                <span class="expansion-icon ${layout.expansion.left ? 'active' : 'inactive'}"></span>
                <span>Left</span>
              </div>
              <div class="expansion-item">
                <span class="expansion-icon ${layout.expansion.right ? 'active' : 'inactive'}"></span>
                <span>Right</span>
              </div>
              <div class="expansion-item">
                <span class="expansion-icon ${layout.expansion.bottom ? 'active' : 'inactive'}"></span>
                <span>Bottom</span>
              </div>
            </div>
          </div>

          <!-- Interactive Actions -->
          <div class="info-card">
            <div class="info-label">Actions (via dispatchUiEvent)</div>
            <div class="actions">
              <button class="btn btn-primary" @click=${() => this.toggleExpansion('left')}>
                Toggle Left
              </button>
              <button class="btn btn-primary" @click=${() => this.toggleExpansion('right')}>
                Toggle Right
              </button>
              <button class="btn btn-primary" @click=${() => this.toggleExpansion('bottom')}>
                Toggle Bottom
              </button>
              <button class="btn btn-secondary" @click=${() => this.changeViewportMode('3x')}>
                3x Mode
              </button>
              <button class="btn btn-secondary" @click=${() => this.changeViewportMode('auto')}>
                Auto Mode
              </button>
              <button class="btn btn-secondary" @click=${this.openSettings}>
                Open Settings
              </button>
              ${auth.isLoggedIn
        ? html`<button class="btn btn-secondary" @click=${this.simulateLogout}>Logout</button>`
        : html`<button class="btn btn-secondary" @click=${this.simulateLogin}>Login</button>`
      }
            </div>
          </div>

          <!-- Architecture Demonstration -->
          <div class="demo-section">
            <div class="demo-title">✅ Correct Patterns Demonstrated</div>
            <div class="demo-text">
              • Context consumption via <code>ContextConsumer</code><br>
              • Read-only context access (no mutations)<br>
              • State updates via <code>dispatchUiEvent</code><br>
              • Reactive UI from context changes<br>
              • Clean separation of concerns
            </div>
          </div>

          <div class="demo-section">
            <div class="demo-title">📚 Framework Architecture</div>
            <div class="demo-text">
              1. <strong>Context</strong>: Shared state (read-only in views)<br>
              2. <strong>Handlers</strong>: Process actions & update state<br>
              3. <strong>Dispatch</strong>: Event-driven state changes<br>
              4. <strong>Registry</strong>: View definitions & lifecycle<br>
              5. <strong>Panels</strong>: Structural containers for views
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
