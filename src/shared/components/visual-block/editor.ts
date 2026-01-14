
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { blockDataContext } from '../../../core/state/contexts.ts';

/**
 * <visual-block-editor>
 *
 * Rationale:
 * - A placeholder component that will eventually house the visual editing interface.
 * - Consumes data from the `visual-block-data` provider.
 */
@customElement('visual-block-editor')
export class VisualBlockEditor extends LitElement {
  @consume({ context: blockDataContext, subscribe: true })
  @property({ type: Object })
  data = {};

  static styles = css`
    :host {
      display: block;
      height: 100%;
      background: #111;
      color: #ccc;
      padding: 1rem;
      font-family: monospace;
      overflow: auto;
    }
  `;

  render() {
    return html`
      <div>
        <h3>Visual Block Editor</h3>
        <pre>\${JSON.stringify(this.data, null, 2)}</pre>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'visual-block-editor': VisualBlockEditor;
  }
}
