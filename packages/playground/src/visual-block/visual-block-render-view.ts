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
import './inspector-view/visual-block-inspector.view';
import './projection-view/visual-block-projection.view';
import './visual-block-grid-overlay/visual-block-grid-overlay';
import './visual-block-toolbar/visual-block-toolbar.view';

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
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 320px;
      gap: 16px;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }
    .main-stage {
      position: relative;
      min-height: 0;
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
    .render-toolbar {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 3;
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
    .debug-panel {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 8px 12px 8px 0;
      overflow: auto;
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
      <div class="layout">
        <div class="main-stage">
          <div class="render-wrapper">
            <visual-block-toolbar class="render-toolbar"></visual-block-toolbar>
            <div class="render-layer content-layer render-container" style=${styleMap(containerStyle)}>
              ${model.rects.map((rect: VisualBlockRectDto) => {
                const content = model.contents[rect._contentID];
                if (!content) {
                  return nothing;
                }
                return this.renderContent(rect, content);
              })}
            </div>
            <visual-block-grid-overlay class="render-layer overlay-layer"></visual-block-grid-overlay>
          </div>
        </div>
        <aside class="debug-panel">
          <visual-block-projection-view></visual-block-projection-view>
          <visual-block-inspector-view></visual-block-inspector-view>
        </aside>
      </div>
    `;
  }
}
