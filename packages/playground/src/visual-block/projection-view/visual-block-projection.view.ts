import { LitElement, css, html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { styleMap } from 'lit/directives/style-map.js';
import { coreContext, type CoreContext } from '../../../../framework/src/nxt';
import type { UIState } from '@project/framework';
import {
  type VisualBlockProjectionModel,
  visualBlockProjectionModelSelectorKey,
} from './visual-block-projection.selectors';
import { VisualBlockActionCatalog } from '../visual-block-action-catalog';

const DEFAULT_PREVIEW_WIDTH = 720;
const ROTATION_MIN = -90;
const ROTATION_MAX = 90;
const ROTATION_STEP = 1;

@customElement('visual-block-projection-view')
export class VisualBlockProjectionView extends LitElement {
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
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    h4 {
      margin: 0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
    }
    .angle {
      font-size: 12px;
      font-weight: 600;
      color: #0f172a;
    }
    .projection-frame {
      width: 100%;
      background: linear-gradient(135deg, rgba(226, 232, 240, 0.8), rgba(248, 250, 252, 0.95));
      border-radius: 12px;
      padding: 12px;
      box-sizing: border-box;
    }
    .projection-perspective {
      perspective: 900px;
      transform-style: preserve-3d;
    }
    .projection-surface {
      display: grid;
      transform-style: preserve-3d;
      transition: transform 0.2s ease;
      border-radius: 10px;
      background: white;
      box-shadow: 0 10px 30px -20px rgba(15, 23, 42, 0.35);
      overflow: hidden;
    }
    .block {
      border: 1px solid rgba(148, 163, 184, 0.45);
      background: rgba(226, 232, 240, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #1e293b;
      box-sizing: border-box;
    }
    .block.selected {
      border-color: #2563eb;
      background: rgba(37, 99, 235, 0.15);
      color: #1d4ed8;
      font-weight: 600;
    }
    .controls {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .control-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .control-row label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
      font-weight: 600;
    }
    input[type='range'] {
      flex: 1;
      accent-color: #2563eb;
    }
    button {
      border: 1px solid rgba(148, 163, 184, 0.4);
      background: #f8fafc;
      color: #0f172a;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover {
      background: #e2e8f0;
    }
    .empty {
      font-size: 12px;
      color: #94a3b8;
      padding: 8px 0;
    }
  `;

  private getProjectionModel(): VisualBlockProjectionModel | null {
    return this.core?.select<VisualBlockProjectionModel>(visualBlockProjectionModelSelectorKey) ?? null;
  }

  private resolvePreviewWidth(model: VisualBlockProjectionModel): number {
    if (typeof model.maxWidth === 'number' && Number.isFinite(model.maxWidth)) {
      return model.maxWidth;
    }
    if (typeof model.maxWidth === 'string') {
      const parsed = Number.parseFloat(model.maxWidth);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return DEFAULT_PREVIEW_WIDTH;
  }

  private dispatchRotation(rotationY: number): void {
    this.core?.dispatch({
      action: VisualBlockActionCatalog.VisualBlockRotationChanged,
      payload: {
        ui: {
          rotationY,
        },
      },
    });
  }

  private handleRotationInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) {
      return;
    }
    const next = Number.parseFloat(target.value);
    if (!Number.isFinite(next)) {
      return;
    }
    this.dispatchRotation(next);
  }

  private rotateBy(delta: number, current: number): void {
    const next = Math.max(ROTATION_MIN, Math.min(ROTATION_MAX, current + delta));
    this.dispatchRotation(next);
  }

  render() {
    const model = this.getProjectionModel();
    if (!model) {
      return html`${nothing}`;
    }

    const width = this.resolvePreviewWidth(model);
    const height = model.rowCount * model.rowHeight + model.padding * 2;
    const containerStyle = {
      gridTemplateColumns: `repeat(${model.columns}, 1fr)`,
      gridTemplateRows: `repeat(${model.rowCount}, ${model.rowHeight}px)`,
      padding: `${model.padding}px`,
      width: `${width}px`,
      height: `${height}px`,
      transform: `rotateY(${model.rotationY}deg)`,
      transformOrigin: 'center',
      boxSizing: 'border-box',
    };

    return html`
      <div class="panel">
        <div class="header">
          <h4>Projection (Rotation Debug)</h4>
          <span class="angle">${Math.round(model.rotationY)}°</span>
        </div>
        <div class="projection-frame">
          <div class="projection-perspective">
            <div class="projection-surface" style=${styleMap(containerStyle)}>
              ${model.blocks.length === 0
                ? html`<div class="empty">No blocks to project.</div>`
                : model.blocks.map((block) => {
                    const className = model.selectedIds.includes(block.id) ? 'block selected' : 'block';
                    const blockStyle = {
                      gridColumnStart: `${block.x + 1}`,
                      gridColumnEnd: `span ${block.w}`,
                      gridRowStart: `${block.y + 1}`,
                      gridRowEnd: `span ${block.h}`,
                    };
                    return html`
                      <div class=${className} style=${styleMap(blockStyle)}>
                        ${block.type ?? 'Block'}
                      </div>
                    `;
                  })}
            </div>
          </div>
        </div>
        <div class="controls">
          <div class="control-row">
            <label for="rotation">Rotation</label>
            <input
              id="rotation"
              type="range"
              min=${ROTATION_MIN}
              max=${ROTATION_MAX}
              step=${ROTATION_STEP}
              .value=${String(model.rotationY)}
              @input=${this.handleRotationInput}
              aria-label="Rotation"
            />
          </div>
          <div class="control-row">
            <button type="button" @click=${() => this.rotateBy(-15, model.rotationY)}>
              Rotate Left
            </button>
            <button type="button" @click=${() => this.rotateBy(15, model.rotationY)}>
              Rotate Right
            </button>
            <button type="button" @click=${() => this.dispatchRotation(0)}>
              Reset
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
