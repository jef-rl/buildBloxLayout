import { LitElement, html, css, nothing } from 'lit';

import '../inputs/index';
import { createJsonTreeNodeHandlers } from '../../../handlers/shared/json-editor/json-editor.handlers';

type JsonConfig = Record<string, string>;

export class JsonTreeNode extends LitElement {
  static properties = {
    data: { type: Object },
    propKey: { type: String },
    path: { type: Array },
    level: { type: Number },
    isArrayItem: { type: Boolean },
    config: { type: Object },
    collapsed: { type: Boolean, state: true },
    addingMode: { type: Boolean, state: true },
    changingType: { type: Boolean, state: true },
  };

  static styles = css`
    :host {
      display: block;
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      font-weight: 300;
      line-height: 1.3;
      color: #e5e7eb;
    }
    .row {
      display: flex;
      align-items: center;
      padding: 0;
      gap: 4px;
      transition: background-color 0.1s;
      min-height: 20px;
    }
 
    .indent-guide {
      margin-left: 8px;
      padding-left: 8px;
      border-left: 1px solid #374151;
    }
    .key-container {
      display: flex;
      align-items: center;
      color: #93c5fd; /* blue-300 */
      font-weight: 400;
    }
    .key-input {
      border: none;
      background: transparent;
      color: inherit;
      font-family: inherit;
      font-weight: inherit;
      font-size: inherit;
      width: auto;
      min-width: 10px;
      outline: none;
      border-bottom: 1px dashed transparent;
      padding: 0;
      margin: 0;
      height: 16px;
    }
    .key-input:focus {
      border-bottom-color: currentColor;
    }
    .toggle-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #6b7280;
      padding: 0;
      width: 12px;
      height: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
    }

    .action-btn {
      opacity: 0;
      background: none;
      border: none;
      cursor: pointer;
      color: #ef4444;
      padding: 0 2px;
      font-size: 10px;
      transition: opacity 0.2s;
      line-height: 1;
    }

    .add-btn {
      color: #10b981;
      font-size: 12px;
    }

    .type-icon {
      width: 12px;
      height: 12px;
      vertical-align: middle;
    }
    .complex-value {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
    }

    .add-toolbar {
      display: flex;
      gap: 2px;
      align-items: center;
    }
    .type-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      padding: 0;
      border: 1px solid #4b5563;
      background: #1f2937;
      color: #d1d5db;
      cursor: pointer;
      border-radius: 2px;
      transition: all 0.1s;
    }
  
    .type-btn svg {
      width: 10px;
      height: 10px;
    }

    .cancel-btn {
      color: #ef4444;
      border-color: transparent;
      background: transparent;
    }
  

    .icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      margin-right: 2px;
      flex-shrink: 0;
      color: #6b7280;
      cursor: pointer;
      border-radius: 2px;
    }
  
  `;

  declare data: any;
  declare propKey: string | undefined;
  declare path: (string | number)[];
  declare level: number;
  declare isArrayItem: boolean;
  declare config: JsonConfig;
  declare collapsed: boolean;
  declare addingMode: boolean;
  declare changingType: boolean;

  private handlers = createJsonTreeNodeHandlers(this);

  constructor() {
    super();
    this.collapsed = false;
    this.addingMode = false;
    this.changingType = false;
    this.config = {};
    this.path = [];
    this.level = 0;
    this.isArrayItem = false;
    this.data = {};
  }

  private _getType(val: any) {
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    return typeof val;
  }

  private _getPathString() {
    return this.path.join('.');
  }

  private _renderValueInput(type: string) {
    const pathStr = this._getPathString();
    const configType = this.config[pathStr];

    if (configType === 'slider')
      return html`<app-slider-input .value=${this.data} @value-change=${this.handlers.handleValueUpdate}></app-slider-input>`;
    if (configType === 'color')
      return html`<app-color-input .value=${this.data} @value-change=${this.handlers.handleValueUpdate}></app-color-input>`;
    if (configType === 'boolean')
      return html`<app-boolean-input .value=${this.data} @value-change=${this.handlers.handleValueUpdate}></app-boolean-input>`;

    if (type === 'boolean')
      return html`<app-boolean-input .value=${this.data} @value-change=${this.handlers.handleValueUpdate}></app-boolean-input>`;
    if (type === 'number')
      return html`<app-number-input .value=${this.data} @value-change=${this.handlers.handleValueUpdate}></app-number-input>`;
    if (type === 'string' && /^#[0-9A-F]{6}$/i.test(this.data))
      return html`<app-color-input .value=${this.data} @value-change=${this.handlers.handleValueUpdate}></app-color-input>`;

    return html`<app-text-input .value=${String(this.data)} @value-change=${this.handlers.handleValueUpdate}></app-text-input>`;
  }

  render() {
    const type = this._getType(this.data);
    const isComplex = type === 'object' || type === 'array';
    const isEmpty = isComplex && Object.keys(this.data ?? {}).length === 0;

    const objectIcon = html`<svg class="type-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13.28a2 2 0 0 0 2 2h16Z"/></svg>`;
    const arrayIcon = html`<svg class="type-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`;
    const stringIcon = html`<svg class="type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>`;
    const numberIcon = html`<svg class="type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`;
    const booleanIcon = html`<svg class="type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="5" width="22" height="14" rx="7" ry="7"/><circle cx="16" cy="12" r="3"/></svg>`;
    const closeIcon = html`<svg class="type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

    const renderToolbar = (clickAction: (t: string, e: Event) => void, cancelAction: (e: Event) => void) => html`
      <div class="add-toolbar">
        <button class="type-btn" title="String" @click=${(e: Event) => clickAction('string', e)}>${stringIcon}</button>
        <button class="type-btn" title="Number" @click=${(e: Event) => clickAction('number', e)}>${numberIcon}</button>
        <button class="type-btn" title="Boolean" @click=${(e: Event) => clickAction('boolean', e)}>${booleanIcon}</button>
        <button class="type-btn" title="Object" @click=${(e: Event) => clickAction('object', e)}>${objectIcon}</button>
        <button class="type-btn" title="Array" @click=${(e: Event) => clickAction('array', e)}>${arrayIcon}</button>
        <button class="type-btn cancel-btn" title="Cancel" @click=${cancelAction}>${closeIcon}</button>
      </div>
    `;

    let typeIcon = nothing;
    if (type === 'array') typeIcon = arrayIcon;
    else if (type === 'object') typeIcon = objectIcon;
    else if (type === 'string') typeIcon = stringIcon;
    else if (type === 'number') typeIcon = numberIcon;
    else if (type === 'boolean') typeIcon = booleanIcon;

    const iconOrToolbar = this.changingType
      ? renderToolbar((t, e) => this.handlers.commitChangeType(t, e), (e) => this.handlers.cancelChangeType(e))
      : html`
          <div
            class="icon-container"
            title="Click to change type"
            @click=${(e: Event) => this.handlers.startChangeType(e)}
          >
            ${typeIcon}
          </div>
        `;

    let keyTemplate = nothing;
    if (this.propKey !== undefined && !this.isArrayItem) {
      keyTemplate = html`
        <div class="key-container">
          <input
            class="key-input"
            .value=${this.propKey}
            @blur=${this.handlers.handleKeyChange}
            @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          />
        </div>
      `;
    }

    let valueTemplate;
    if (isComplex) {
      valueTemplate = html`
        <span class="complex-value">${this.collapsed && !isEmpty ? html`<span style="color: #6b7280; font-size: 0.8em;">...</span>` : nothing}</span>
      `;
    } else {
      valueTemplate = this._renderValueInput(type);
    }

    const toggleBtn = isComplex && !isEmpty
      ? html`<button class="toggle-btn" @click=${this.handlers.toggleCollapse}>${this.collapsed ? '▶' : '▼'}</button>`
      : html`<span class="toggle-btn"></span>`;

    const deleteBtn = this.propKey !== undefined ? html`<button class="action-btn" title="Delete" @click=${this.handlers.handleDelete}>×</button>` : nothing;

    let addBtn = nothing;
    if (isComplex) {
      if (this.addingMode) {
        addBtn = renderToolbar((t, e) => this.handlers.commitAddChild(t, e), (e) => this.handlers.cancelAddChild(e));
      } else {
        addBtn = html`<button class="action-btn add-btn" title="Add Child" @click=${this.handlers.startAddChild}>+</button>`;
      }
    }

    return html`
      <div class="row">${toggleBtn}${iconOrToolbar}${keyTemplate}${valueTemplate}${addBtn}${deleteBtn}</div>
      ${isComplex && !this.collapsed && !isEmpty
        ? html`
            <div class="indent-guide">
              ${Object.entries(this.data).map(
                ([k, v]) => html`
                  <json-tree-node
                    .data=${v}
                    .propKey=${k}
                    .path=${[...this.path, k]}
                    .level=${this.level + 1}
                    .config=${this.config}
                    .isArrayItem=${type === 'array'}
                  ></json-tree-node>
                `
              )}
            </div>
          `
        : nothing}
    `;
  }
}

customElements.define('json-tree-node', JsonTreeNode);
