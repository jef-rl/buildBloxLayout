import { LitElement, html, css } from 'lit';
import './json-tree-node';
import { createJsonEditorHandlers } from '../../../handlers/shared/json-editor/json-editor.handlers';

export class JsonEditor extends LitElement {
  static properties = {
    data: { type: Object },
    config: { type: Object },
  };

  static styles = css`
    :host {
      display: block;
      background: transparent;
      border-radius: 4px;
      border: none;
      padding: 8px;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      overflow-y: auto;
    }
  `;

  declare data: any;
  declare config: Record<string, string>;

  private handlers = createJsonEditorHandlers(this);

  constructor() {
    super();
    this.data = {};
    this.config = {};
  }

  render() {
    return html`
      <div
        @update-value=${this.handlers.handleUpdateValue}
        @rename-key=${this.handlers.handleRenameKey}
        @delete-node=${this.handlers.handleDeleteNode}
        @add-child=${this.handlers.handleAddChild}
        @change-type=${this.handlers.handleChangeType}
      >
        <json-tree-node .data=${this.data} .path=${[]} .level=${0} .config=${this.config}></json-tree-node>
      </div>
    `;
  }
}

customElements.define('json-editor', JsonEditor);
