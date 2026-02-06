import { LitElement, css, html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { styleMap } from 'lit/directives/style-map.js';
import { coreContext, type CoreContext } from '../../../framework/src/nxt';
import type { UIState } from '@project/framework';
import type { VisualBlockContentDto } from './dto/visual-block-content.dto';
import type { VisualBlockRectDto } from './dto/visual-block-rect.dto';
import type { VisualBlockRenderModel } from './selectors/visual-block-render-model.selector';
import { visualBlockRenderModelSelectorKey } from './selectors/visual-block-render-model.selector';
import {
  normalizeStyleMap,
  renderVisualBlockContent,
  resolveBackgroundImage,
} from './visual-block-render-helpers';

const PREVIEW_SCALE = 0.6;
const DEFAULT_PREVIEW_WIDTH = 800;

@customElement('visual-block-preview')
export class VisualBlockPreviewView extends LitElement {
  @consume({ context: coreContext, subscribe: true })
  core?: CoreContext<UIState>;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    h4 {
      margin: 0;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.05em;
    }
    .preview-frame {
      background: white;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
      transform-origin: top left;
      transition: width 0.2s, height 0.2s;
    }
    .preview-content {
      display: grid;
    }
    .block {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      min-width: 0;
      min-height: 0;
    }
    .block img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `;

  private resolvePreviewWidth(model: VisualBlockRenderModel): number {
    const maxWidth = model.maxWidth;
    if (typeof maxWidth === 'number' && Number.isFinite(maxWidth)) {
      return maxWidth;
    }
    if (typeof maxWidth === 'string') {
      const parsed = Number.parseFloat(maxWidth);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return DEFAULT_PREVIEW_WIDTH;
  }

  private renderBlock(rect: VisualBlockRectDto, content: VisualBlockContentDto) {
    const style = normalizeStyleMap(content.styler as Record<string, unknown> | undefined);
    const hasBackgroundImage = Boolean(resolveBackgroundImage(content.styler as Record<string, unknown> | undefined));

    const layoutStyle = {
      ...style,
      gridColumnStart: `${rect.x + 1}`,
      gridColumnEnd: `span ${rect.w}`,
      gridRowStart: `${rect.y + 1}`,
      gridRowEnd: `span ${rect.h}`,
      width: '100%',
      height: '100%',
      zIndex: rect.z ?? 'auto',
      boxSizing: 'border-box',
      margin: 0,
    };

    return html`
      <div class="block" style=${styleMap(layoutStyle)}>
        ${renderVisualBlockContent(content, hasBackgroundImage)}
      </div>
    `;
  }

  render() {
    const model = this.core?.select<VisualBlockRenderModel>(visualBlockRenderModelSelectorKey);
    if (!model || model.rects.length === 0) {
      return html`${nothing}`;
    }

    const width = this.resolvePreviewWidth(model);
    const height = model.rowCount * model.rowHeight + model.padding * 2;

    const containerStyle = {
      gridTemplateColumns: `repeat(${model.columns}, 1fr)`,
      gridTemplateRows: `repeat(${model.rowCount}, ${model.rowHeight}px)`,
      padding: `${model.padding}px`,
      boxSizing: 'border-box',
      transform: `scale(${PREVIEW_SCALE})`,
      transformOrigin: 'top left',
      width: `${width}px`,
      height: `${height}px`,
    };

    return html`
      <h4>2D Projection (Face On)</h4>
      <div class="preview-frame" style="width: ${width * PREVIEW_SCALE}px; height: ${height * PREVIEW_SCALE}px;">
        <div class="preview-content" style=${styleMap(containerStyle)}>
          ${model.rects.map((rect: VisualBlockRectDto) => {
            const content = model.contents[rect._contentID];
            if (!content) {
              return nothing;
            }
            return this.renderBlock(rect, content);
          })}
        </div>
      </div>
    `;
  }
}
