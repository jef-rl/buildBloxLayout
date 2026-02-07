import { LitElement, css, html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { coreContext, type CoreContext } from '../../../../framework/src/nxt';
import type { UIState } from '@project/framework';
import type { VisualBlockDataState } from '../state/visual-block-data-state';
import { visualBlockDataSelectorKey } from '../selectors/visual-block-data.selector';
import type { VisualBlockUiStateDto } from '../dto/visual-block-ui-state.dto';
import { visualBlockUiSelectorKey } from '../selectors/visual-block-ui.selector';

@customElement('visual-block-state-debug')
export class VisualBlockStateDebugView extends LitElement {
  @consume({ context: coreContext, subscribe: true })
  core?: CoreContext<UIState>;

  static styles = css`
    :host {
      display: block;
      font-family: 'Inter', system-ui, sans-serif;
      color: #0f172a;
    }
    .panel {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 12px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(148, 163, 184, 0.3);
      box-shadow: 0 12px 24px -16px rgba(15, 23, 42, 0.35);
    }
    h4 {
      margin: 0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
    }
    .summary {
      font-size: 12px;
      color: #334155;
      display: grid;
      gap: 4px;
    }
    details {
      font-size: 11px;
      color: #475569;
      background: #f8fafc;
      border-radius: 10px;
      border: 1px solid rgba(148, 163, 184, 0.3);
      padding: 8px 10px;
    }
    summary {
      cursor: pointer;
      font-weight: 600;
      color: #0f172a;
    }
    pre {
      margin: 8px 0 0;
      white-space: pre-wrap;
      word-break: break-word;
    }
  `;

  private getDataState(): VisualBlockDataState | null {
    return this.core?.select<VisualBlockDataState>(visualBlockDataSelectorKey) ?? null;
  }

  private getUiState(): VisualBlockUiStateDto | null {
    return this.core?.select<VisualBlockUiStateDto>(visualBlockUiSelectorKey) ?? null;
  }

  private renderJson(value: unknown) {
    if (!value) {
      return html`${nothing}`;
    }
    return html`<pre>${JSON.stringify(value, null, 2)}</pre>`;
  }

  render() {
    const dataState = this.getDataState();
    const uiState = this.getUiState();

    if (!dataState && !uiState) {
      return html`${nothing}`;
    }

    const layoutCount = dataState ? Object.keys(dataState.layouts).length : 0;
    const contentCount = dataState ? Object.keys(dataState.contents).length : 0;
    const rectCount = dataState ? Object.keys(dataState.rects).length : 0;

    return html`
      <div class="panel">
        <h4>State Snapshot</h4>
        <div class="summary">
          <div>Layouts: ${layoutCount}</div>
          <div>Rects: ${rectCount}</div>
          <div>Contents: ${contentCount}</div>
          <div>Selected: ${uiState?.selectedIds?.length ?? 0}</div>
        </div>
        <details>
          <summary>visualBlockData</summary>
          ${this.renderJson(dataState)}
        </details>
        <details>
          <summary>visualBlockUi</summary>
          ${this.renderJson(uiState)}
        </details>
      </div>
    `;
  }
}
