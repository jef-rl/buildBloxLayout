import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { dispatchUiEvent } from '@project/framework';

@customElement('configurator-view')
export class ConfiguratorView extends LitElement {
  @property({ type: String }) instanceId = '';
  @property({ type: Object }) context: Record<string, any> = {};

  static styles = css`
    :host {
      display: block;
      height: 100%;
      padding: 24px;
      box-sizing: border-box;
      color: #1e293b;
      transition: background-color 0.3s ease;
    }
    .card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      max-width: 400px;
      margin: 0 auto;
    }
    h2 { margin-top: 0; }
    .form-group {
      margin-bottom: 16px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 0.9rem;
    }
    input, select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    .preview {
      margin-top: 24px;
      padding: 12px;
      border-radius: 6px;
      background: #f1f5f9;
      font-family: monospace;
      font-size: 0.8rem;
    }
  `;

  private updateSetting(key: string, value: string) {
    dispatchUiEvent(this, 'view/updateLocalContext', {
      instanceId: this.instanceId,
      context: { [key]: value }
    });
  }

  render() {
    const bgColor = this.context.bgColor || '#f8fafc';
    const title = this.context.customTitle || 'Configurator';

    return html`
      <style>
        :host { background-color: ${bgColor}; }
      </style>
      <div class="card">
        <h2>${title}</h2>
        
        <div class="form-group">
          <label>Panel Title</label>
          <input 
            type="text" 
            .value=${title}
            @input=${(e: any) => this.updateSetting('customTitle', e.target.value)}
          >
        </div>

        <div class="form-group">
          <label>Background Color</label>
          <select 
            .value=${bgColor} 
            @change=${(e: any) => this.updateSetting('bgColor', e.target.value)}
          >
            <option value="#f8fafc">Slate (Default)</option>
            <option value="#f0f9ff">Sky</option>
            <option value="#f0fdf4">Green</option>
            <option value="#fdf2f8">Pink</option>
          </select>
        </div>

        <div class="preview">
          <strong>Current Context:</strong><br>
          ${JSON.stringify(this.context, null, 2)}
        </div>
      </div>
    `;
  }
}
