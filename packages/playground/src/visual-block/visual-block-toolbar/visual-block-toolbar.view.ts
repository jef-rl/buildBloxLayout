import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { coreContext, type ActionName, type CoreContext } from '../../../../framework/src/nxt';
import type { Action } from '../../../../framework/src/nxt/runtime/actions/action';
import type { UIState } from '@project/framework';
import type { VisualBlockUiStateDto } from '../dto/visual-block-ui-state.dto';
import type { VisualBlockRenderModel } from '../selectors/visual-block-render-model.selector';
import { visualBlockRenderModelSelectorKey } from '../selectors/visual-block-render-model.selector';
import { visualBlockUiSelectorKey } from '../selectors/visual-block-ui.selector';
import { VisualBlockActionCatalog } from '../visual-block-action-catalog';
import { visualBlockDataRequested } from '../data-loading/visual-block-data-actions';

const DEFAULT_ZOOM = 1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

@customElement('visual-block-toolbar')
export class VisualBlockToolbarView extends LitElement {
  @consume({ context: coreContext, subscribe: true })
  core?: CoreContext<UIState>;

  @state()
  private sourceId = 'demo-default';

  static styles = css`
    :host {
      display: block;
      font-family: 'Inter', system-ui, sans-serif;
      color: #0f172a;
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      box-shadow: 0 10px 20px -10px rgba(15, 23, 42, 0.35);
      border: 1px solid rgba(148, 163, 184, 0.3);
      backdrop-filter: blur(6px);
    }
    .group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
    }
    .button-set {
      display: flex;
      gap: 6px;
    }
    button {
      border: 1px solid rgba(148, 163, 184, 0.4);
      background: #f8fafc;
      color: #0f172a;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }
    button:hover {
      background: #e2e8f0;
    }
    button.active {
      background: #2563eb;
      border-color: #2563eb;
      color: #f8fafc;
    }
    .zoom-value {
      min-width: 48px;
      font-size: 12px;
      font-weight: 600;
      color: #1e293b;
      text-align: right;
    }
    input[type='range'] {
      width: 140px;
      accent-color: #2563eb;
    }
    input[type='text'],
    select {
      border: 1px solid rgba(148, 163, 184, 0.4);
      background: #f8fafc;
      color: #0f172a;
      padding: 6px 8px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
    }
    select:disabled,
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;

  private getUiState(): VisualBlockUiStateDto | null {
    return this.core?.select<VisualBlockUiStateDto>(visualBlockUiSelectorKey) ?? null;
  }

  private getRenderModel(): VisualBlockRenderModel | null {
    return this.core?.select<VisualBlockRenderModel>(visualBlockRenderModelSelectorKey) ?? null;
  }

  private dispatchZoom(zoom: number): void {
    this.core?.dispatch({
      action: VisualBlockActionCatalog.VisualBlockZoomChanged as ActionName,
      payload: {
        ui: {
          zoom,
        },
      },
    });
  }

  private dispatchMode(mode: string): void {
    this.core?.dispatch({
      action: VisualBlockActionCatalog.VisualBlockModeChanged as ActionName,
      payload: {
        ui: {
          mode,
        },
      },
    });
  }

  private dispatchSelection(blockId: string | null): void {
    this.core?.dispatch({
      action: VisualBlockActionCatalog.VisualBlockUiPatch as ActionName,
      payload: {
        ui: {
          selectedIds: blockId ? [blockId] : [],
          blockId: blockId ?? '',
        },
      },
    });
  }

  private handleBlockChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    if (!target) {
      return;
    }
    const next = target.value || null;
    this.dispatchSelection(next);
  }

  private handleZoomInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) {
      return;
    }
    const next = Number.parseFloat(target.value);
    if (!Number.isFinite(next)) {
      return;
    }
    this.dispatchZoom(next);
  }

  private handleSourceInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) {
      return;
    }
    this.sourceId = target.value;
  }

  private requestData(): void {
    if (!this.sourceId.trim()) {
      return;
    }
    this.core?.dispatch(
      visualBlockDataRequested(this.sourceId.trim()) as unknown as Action<any>,
    );
  }

  render() {
    const uiState = this.getUiState();
    const renderModel = this.getRenderModel();
    const zoom = uiState?.zoom ?? DEFAULT_ZOOM;
    const mode = uiState?.mode ?? 'design';
    const zoomLabel = `${Math.round(zoom * 100)}%`;
    const blockOptions = renderModel?.rects ?? [];
    const selectedBlock = uiState?.blockId ?? '';

    return html`
      <div class="toolbar" role="toolbar" aria-label="Visual block controls">
        <div class="group">
          <span class="label">Mode</span>
          <div class="button-set">
            <button
              class=${mode === 'design' ? 'active' : ''}
              @click=${() => this.dispatchMode('design')}
              type="button"
            >
              Design
            </button>
            <button
              class=${mode === 'preview' ? 'active' : ''}
              @click=${() => this.dispatchMode('preview')}
              type="button"
            >
              Preview
            </button>
          </div>
        </div>
        <div class="group">
          <span class="label">Zoom</span>
          <input
            type="range"
            min=${MIN_ZOOM}
            max=${MAX_ZOOM}
            step=${ZOOM_STEP}
            .value=${String(zoom)}
            @input=${this.handleZoomInput}
            aria-label="Zoom"
          />
          <span class="zoom-value">${zoomLabel}</span>
          <button type="button" @click=${() => this.dispatchZoom(DEFAULT_ZOOM)}>Reset</button>
        </div>
        <div class="group">
          <span class="label">Block</span>
          <select
            .value=${selectedBlock}
            @change=${this.handleBlockChange}
            ?disabled=${blockOptions.length === 0}
            aria-label="Select block"
          >
            <option value="">All</option>
            ${blockOptions.map(
              (rect) =>
                html`<option value=${rect._positionID}>
                  ${rect._positionID} · ${rect._contentID}
                </option>`,
            )}
          </select>
        </div>
        <div class="group">
          <span class="label">Data</span>
          <input
            type="text"
            .value=${this.sourceId}
            @input=${this.handleSourceInput}
            aria-label="Data source"
          />
          <button type="button" @click=${this.requestData}>Load</button>
        </div>
      </div>
    `;
  }
}
