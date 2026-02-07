import { LitElement, css, html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import type { CoreContext } from '../../runtime/context/core-context';
import { coreContext } from '../../runtime/context/core-context-key';
import type { LogsViewData } from '../../selectors/logs/logs-view.selector';
import { logsViewSelectorKey } from '../../selectors/logs/logs-view.selector';
import type { LogEntry, UIState } from '../../types/state';
import { ActionCatalog } from '../../runtime/actions/action-catalog';

@customElement('log-view')
export class LogView extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      color: #e2e8f0;
      background: #0f172a;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #1e293b;
    }

    .root {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      border-bottom: 1px solid #1e293b;
      background: #111827;
    }

    .title-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #93c5fd;
    }

    .subtitle {
      font-size: 11px;
      color: #64748b;
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    button {
      font-size: 11px;
      font-weight: 500;
      padding: 6px 10px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      background: #1f2937;
      color: #e2e8f0;
    }

    button:hover {
      background: #334155;
    }

    button.primary {
      background: #2563eb;
      color: #f8fafc;
    }

    button.primary:hover {
      background: #1d4ed8;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .log-entry {
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: rgba(15, 23, 42, 0.7);
      border-radius: 8px;
      padding: 10px 12px;
      border: 1px solid rgba(148, 163, 184, 0.15);
    }

    .log-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 12px;
      color: #cbd5f5;
    }

    .log-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 10px;
      color: #94a3b8;
    }

    .badge {
      padding: 2px 6px;
      border-radius: 999px;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .badge.info {
      background: rgba(59, 130, 246, 0.2);
      color: #93c5fd;
    }

    .badge.warn {
      background: rgba(251, 191, 36, 0.2);
      color: #facc15;
    }

    .badge.error {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
    }

    .badge.debug {
      background: rgba(100, 116, 139, 0.2);
      color: #cbd5f5;
    }

    .log-message {
      font-size: 12px;
      color: #f8fafc;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .log-extra {
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.4;
      white-space: pre-wrap;
    }

    .empty {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 12px;
      padding: 20px;
    }
  `;

  private core: CoreContext<UIState> | null = null;
  private logs: LogsViewData | null = null;

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
      this.logs = null;
      this.requestUpdate();
      return;
    }
    this.logs = this.core.select(logsViewSelectorKey);
    this.requestUpdate();
  }

  private clearLogs() {
    this.core?.dispatch({ action: ActionCatalog.LogsClear });
  }

  private formatLogMessage(log: LogEntry) {
    return log.message;
  }

  private formatLogExtra(log: LogEntry) {
    const extra = log.extra ?? log.data;
    if (!extra) {
      return null;
    }
    return JSON.stringify(extra, null, 2);
  }

  private renderLog(log: LogEntry) {
    const extra = this.formatLogExtra(log);
    return html`
      <div class="log-entry">
        <div class="log-row">
          <span class="log-message">${this.formatLogMessage(log)}</span>
          <div class="log-meta">
            <span class="badge ${log.level}">${log.level}</span>
            <span>${log.timestamp}</span>
          </div>
        </div>
        ${extra ? html`<div class="log-extra">${extra}</div>` : nothing}
      </div>
    `;
  }

  render() {
    const entries = this.logs?.entries ?? [];
    return html`
      <div class="root">
        <header>
          <div class="title-group">
            <span class="title">Framework Logs</span>
            <span class="subtitle">Most recent activity</span>
          </div>
          <div class="controls">
            <button @click=${this.clearLogs}>Clear</button>
          </div>
        </header>
        <div class="content">
          ${entries.length
            ? entries.map((log) => this.renderLog(log))
            : html`<div class="empty">No log entries yet.</div>`}
        </div>
      </div>
    `;
  }
}
