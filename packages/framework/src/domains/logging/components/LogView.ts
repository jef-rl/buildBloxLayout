import { LitElement, css, html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';
import { dispatchUiEvent } from '../../../legacy/dispatcher';
import { ActionCatalog } from '../../../nxt/runtime/actions/action-catalog';

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
      align-items: baseline;
      gap: 12px;
    }

    .title {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #38bdf8;
    }

    .count {
      font-size: 11px;
      color: #64748b;
    }

    .controls {
      display: flex;
      gap: 8px;
    }

    button {
      background: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
      border-radius: 4px;
      padding: 5px 12px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    button:hover:not(:disabled) {
      background: #334155;
      color: #f8fafc;
      border-color: #475569;
    }

    button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .headers {
      display: grid;
      grid-template-columns: 90px 70px 220px 1fr;
      gap: 12px;
      padding: 8px 20px;
      background: #1e293b55;
      border-bottom: 1px solid #1e293b;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #94a3b8;
      letter-spacing: 0.05em;
    }

    .entries {
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;
    }

    .entries::-webkit-scrollbar {
      width: 8px;
    }
    .entries::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 10px;
    }

    .entry {
      display: grid;
      grid-template-columns: 90px 70px 220px 1fr;
      gap: 12px;
      padding: 6px 20px;
      font-size: 12px;
      border-left: 4px solid transparent;
      border-bottom: 1px solid rgba(30, 41, 59, 0.2);
      align-items: start;
    }

    .entry:hover {
      background: rgba(148, 163, 184, 0.05);
    }

    .entry.info { border-left-color: #38bdf8; }
    .entry.warn { border-left-color: #fbbf24; background: rgba(251, 191, 36, 0.02); }
    .entry.error { border-left-color: #f87171; background: rgba(248, 113, 113, 0.02); }
    .entry.debug { border-left-color: #94a3b8; }

    .timestamp { color: #64748b; font-variant-numeric: tabular-nums; }
    
    .level { 
      font-weight: 700; 
      font-size: 9px; 
      text-align: center;
      padding: 1px 0;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.05);
    }

    .info .level { color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.2); }
    .warn .level { color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.2); }
    .error .level { color: #f87171; border: 1px solid rgba(248, 113, 113, 0.2); }
    .debug .level { color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.2); }

    .event-type {
      font-weight: 600;
      font-size: 11px;
    }
    
    .info .event-type { color: #7dd3fc; }
    .warn .event-type { color: #fcd34d; }
    .error .event-type { color: #fca5a1; }
    .debug .event-type { color: #94a3b8; }

    .message-cell {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .message { 
      white-space: pre-wrap; 
      word-break: break-word; 
      line-height: 1.5;
    }

    .data {
      color: #94a3b8;
      font-size: 11px;
      white-space: pre-wrap;
      background: #020617;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #1e293b;
      margin: 4px 0;
    }

    .empty { 
      padding: 60px 20px; 
      color: #475569; 
      font-size: 13px; 
      text-align: center; 
    }
  `;

  private entries: any[] = [];
  private maxEntries = 200;

  private uiStateConsumer = new ContextConsumer(this, {
    context: uiStateContext,
    subscribe: true,
    callback: (value: UiStateContextValue | undefined) => {
      this.entries = value?.state?.logs?.entries ?? [];
      this.maxEntries = value?.state?.logs?.maxEntries ?? 0;
      this.requestUpdate();
    },
  });

  private handleClear() {
    dispatchUiEvent(this, ActionCatalog.LogsClear);
  }


  private formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  private formatData(data: any): string | null {
    if (!data) return null;

    if (typeof data === 'object' && !Array.isArray(data)) {
      const { type: _type, ...rest } = data as Record<string, unknown>;
      if (Object.keys(rest).length === 0) return null;
      try {
        return JSON.stringify(rest, null, 2);
      } catch {
        return String(rest);
      }
    }

    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  /**
   * Scans log data to find common event/action types
   */
  private getEventType(entry: any): string {
    if (!entry.data) return '—';
    if (entry.data?.type) return entry.data.type;
    if (Array.isArray(entry.data.actionTypes) && entry.data.actionTypes.length > 0) {
      return entry.data.actionTypes[0];
    }
    return '—';
  }

  render() {
    return html`
 <div class="root">
        <header>
          <div class="title-group">
            <div class="title">Terminal Logs</div>
            <div class="count">${this.entries.length} / ${this.maxEntries}</div>
          </div>
          <div class="controls">
            <button @click=${this.handleClear} ?disabled=${this.entries.length === 0}>
              Clear Console
            </button>
          </div>
        </header>
        
        <div class="headers">
          <div>Time</div>
          <div>Level</div>
          <div>Event / Action</div>
          <div>Message</div>
        </div>

        <div class="entries">
          ${this.entries.length === 0
        ? html`<div class="empty">Waiting for log activity...</div>`
        : this.entries.reverse().map((entry: any) => {
          const data = this.formatData(entry.data);
          const eventType = this.getEventType(entry);
          return html`
                  <div class="entry ${entry.level}">
                    <div class="timestamp">${this.formatTimestamp(entry.timestamp)}</div>
                    <div class="level">${entry.level}</div>
                    <div class="event-type">${eventType}</div>
                    <div class="message-cell">
                      <div class="message">${entry.message}</div>
                      ${data ? html`<div class="data">${data}</div>` : nothing}
                    </div>
                  </div>
                `;
        })}
        </div>
      </div>
    `;
  }
}
