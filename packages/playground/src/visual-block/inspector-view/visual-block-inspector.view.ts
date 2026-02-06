import { LitElement, css, html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { coreContext, type CoreContext } from '../../../../framework/src/nxt';
import type { UIState } from '@project/framework';
import {
  type VisualBlockInspectorModel,
  visualBlockInspectorModelSelectorKey,
} from './visual-block-inspector.selectors';
import { VisualBlockActionCatalog } from '../visual-block-action-catalog';

@customElement('visual-block-inspector-view')
export class VisualBlockInspectorView extends LitElement {
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
      gap: 12px;
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
    }
    .empty {
      padding: 8px 0;
      font-size: 12px;
      color: #94a3b8;
    }
    .item {
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 10px;
      padding: 10px;
      display: grid;
      gap: 6px;
      background: #f8fafc;
      cursor: pointer;
    }
    .item.active {
      border-color: #2563eb;
      background: rgba(37, 99, 235, 0.1);
    }
    .item-title {
      font-weight: 600;
      font-size: 13px;
      color: #0f172a;
    }
    .meta {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 4px 10px;
      font-size: 11px;
      color: #475569;
    }
    .meta span {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }
    .meta strong {
      color: #0f172a;
      font-weight: 600;
    }
  `;

  private getInspectorModel(): VisualBlockInspectorModel | null {
    return this.core?.select<VisualBlockInspectorModel>(visualBlockInspectorModelSelectorKey) ?? null;
  }

  private handleSelect(id: string): void {
    this.core?.dispatch({
      action: VisualBlockActionCatalog.VisualBlockUiPatch,
      payload: {
        ui: {
          selectedIds: [id],
          blockId: id,
        },
      },
    });
  }

  render() {
    const model = this.getInspectorModel();
    if (!model) {
      return html`${nothing}`;
    }

    return html`
      <div class="panel">
        <h4>Inspector</h4>
        <div class="summary">
          Selected: ${model.selectedIds.length > 0 ? model.selectedIds.length : 'None'}
        </div>
        ${model.items.length === 0
          ? html`<div class="empty">Select a block to inspect metadata.</div>`
          : model.items.map((item) => {
              const isActive = model.activeId === item.id;
              return html`
                <div
                  class=${isActive ? 'item active' : 'item'}
                  role="button"
                  tabindex="0"
                  @click=${() => this.handleSelect(item.id)}
                >
                  <div class="item-title">${item.type ?? 'Block'} · ${item.id}</div>
                  <div class="meta">
                    <span>Content <strong>${item.contentId}</strong></span>
                    <span>Rotation <strong>${Math.round(item.rotationY)}°</strong></span>
                    <span>X <strong>${item.x}</strong></span>
                    <span>Y <strong>${item.y}</strong></span>
                    <span>W <strong>${item.w}</strong></span>
                    <span>H <strong>${item.h}</strong></span>
                    <span>Z <strong>${item.z ?? 0}</strong></span>
                  </div>
                </div>
              `;
            })}
      </div>
    `;
  }
}
