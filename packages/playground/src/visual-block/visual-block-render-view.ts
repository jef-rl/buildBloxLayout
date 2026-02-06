import { LitElement, css, html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { styleMap } from 'lit/directives/style-map.js';
import { coreContext, type CoreContext } from '@project/framework/nxt';
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
import './visual-block-grid-overlay/visual-block-grid-overlay';

@customElement('visual-block-render')
export class VisualBlockRenderView extends LitElement {
  @consume({ context: coreContext, subscribe: true })
  core?: CoreContext<UIState>;

  static styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
    }
    .render-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .render-layer {
      position: absolute;
      inset: 0;
    }
    .render-layer.content-layer {
      z-index: 1;
    }
    .render-layer.overlay-layer {
      z-index: 2;
    }
    .render-container {
      width: 100%;
      height: 100%;
      display: grid;
    }
    .content-item {
      display: grid;
      font-family: inherit;
      min-width: 0;
      min-height: 0;
    }
  `;

  private renderContent(rect: VisualBlockRectDto, content: VisualBlockContentDto) {
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
      position: 'relative',
      zIndex: rect.z ?? 'auto',
      overflow: 'hidden',
      boxSizing: 'border-box',
      margin: 0,
    };

    return html`
      <div class="content-item" style=${styleMap(layoutStyle)}>
        ${renderVisualBlockContent(content, hasBackgroundImage)}
      </div>
    `;
  }

  render() {
    const model = this.core?.select<VisualBlockRenderModel>(visualBlockRenderModelSelectorKey);
    if (!model || model.rects.length === 0) {
      return html`${nothing}`;
    }

    const containerStyle = {
      ...normalizeStyleMap(model.layout?.styler as Record<string, unknown> | undefined),
      gridTemplateColumns: `repeat(${model.columns}, 1fr)`,
      gridTemplateRows: `repeat(${model.rowCount}, ${model.rowHeight}px)`,
      padding: `${model.padding}px`,
      boxSizing: 'border-box',
      maxWidth: model.maxWidth ?? undefined,
    };

    return html`
      <div class="render-wrapper">
        <div class="render-layer content-layer render-container" style=${styleMap(containerStyle)}>
          ${model.rects.map((rect) => {
            const content = model.contents[rect._contentID];
            if (!content) {
              return nothing;
            }
            return this.renderContent(rect, content);
          })}
        </div>
        <visual-block-grid-overlay class="render-layer overlay-layer"></visual-block-grid-overlay>
      </div>
    `;
  }
}
