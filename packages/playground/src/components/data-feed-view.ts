import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('data-feed-view')
export class DataFeedView extends LitElement {
  @property({ type: String }) instanceId = '';
  @property({ type: Object }) context: Record<string, any> = {};
  
  @state() private messages: Array<{id: number, text: string, time: string}> = [];
  private intervalId: number | null = null;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #1e1e1e;
      color: #4ade80;
      font-family: 'Courier New', Courier, monospace;
      overflow: hidden;
    }
    .header {
      background: #2d2d2d;
      padding: 8px 16px;
      font-weight: bold;
      border-bottom: 1px solid #333;
      display: flex;
      justify-content: space-between;
    }
    .feed {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .entry {
      display: flex;
      gap: 12px;
      opacity: 0.9;
      animation: fadeIn 0.3s ease;
    }
    .time {
      opacity: 0.5;
      min-width: 80px;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 0.9; transform: translateY(0); }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.startFeed();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.intervalId) window.clearInterval(this.intervalId);
  }

  private startFeed() {
    const topic = this.context.topic || 'System';
    const speed = this.context.speed || 2000;

    this.intervalId = window.setInterval(() => {
      const now = new Date();
      const time = now.toLocaleTimeString();
      const id = Date.now();
      const messages = [
        `[${topic}] Processing request #${id.toString().slice(-4)}`,
        `[${topic}] Data sync complete`,
        `[${topic}] Heartbeat signal received`,
        `[${topic}] Cache invalidated`,
        `[${topic}] User activity detected`
      ];
      const text = messages[Math.floor(Math.random() * messages.length)];
      
      this.messages = [{id, time, text}, ...this.messages].slice(0, 50);
    }, speed);
  }

  render() {
    const topic = this.context.topic || 'System';
    return html`
      <div class="header">
        <span>TERMINAL: ${topic.toUpperCase()}</span>
        <span>ID: ${this.instanceId.slice(-6)}</span>
      </div>
      <div class="feed">
        ${this.messages.map(msg => html`
          <div class="entry">
            <span class="time">[${msg.time}]</span>
            <span>${msg.text}</span>
          </div>
        `)}
      </div>
    `;
  }
}
