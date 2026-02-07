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
import { visualBlockDataRequested } from './data-loading/visual-block-data-actions';
import './inspector-view/visual-block-inspector.view';
import './projection-view/visual-block-projection.view';
import './debug/visual-block-state-debug.view';
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
    .render-empty {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 24px;
      color: #e2e8f0;
    }
    .render-empty-card {
      max-width: 360px;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(148, 163, 184, 0.35);
      border-radius: 16px;
      padding: 18px;
      box-shadow: 0 20px 40px -30px rgba(15, 23, 42, 0.8);
      display: grid;
      gap: 12px;
    }
    .render-empty-card h3 {
      margin: 0;
      font-size: 16px;
      color: #f8fafc;
    }
    .render-empty-card p {
      margin: 0;
      font-size: 13px;
      color: #cbd5f5;
      line-height: 1.5;
    }
    .render-empty-card button {
      border: 1px solid rgba(148, 163, 184, 0.4);
      background: #f8fafc;
      color: #0f172a;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      justify-self: center;
    }
    .render-empty-card button:hover {
      background: #e2e8f0;
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

  private requestDemoData(): void {
    this.core?.dispatch(visualBlockDataRequested('demo-default'));
  }

  render() {
    const model =
      this.core?.select<VisualBlockRenderModel>(visualBlockRenderModelSelectorKey) ?? null;
    const hasRects = Boolean(model?.rects && model.rects.length > 0);
    const resolvedModel: VisualBlockRenderModel = model ?? {
      layoutId: null,
      layout: null,
      rects: [],
      contents: {},
      columns: 24,
      rowHeight: 16,
      padding: 40,
      rowCount: 6,
    };

    const containerStyle = {
      ...normalizeStyleMap(resolvedModel.layout?.styler as Record<string, unknown> | undefined),
      gridTemplateColumns: `repeat(${resolvedModel.columns}, 1fr)`,
      gridTemplateRows: `repeat(${resolvedModel.rowCount}, ${resolvedModel.rowHeight}px)`,
      padding: `${resolvedModel.padding}px`,
      boxSizing: 'border-box',
      maxWidth: resolvedModel.maxWidth ?? undefined,
    };

    return html`
      <div class="layout">
        <div class="main-stage">
          <div class="render-wrapper">
            <visual-block-toolbar class="render-toolbar"></visual-block-toolbar>
            <div class="render-layer content-layer render-container" style=${styleMap(containerStyle)}>
              ${resolvedModel.rects.map((rect: VisualBlockRectDto) => {
                const content = resolvedModel.contents[rect._contentID];
                if (!content) {
                  return nothing;
                }
                return this.renderContent(rect, content);
              })}
            </div>
            <visual-block-grid-overlay class="render-layer overlay-layer"></visual-block-grid-overlay>
            ${!hasRects
              ? html`
                  <div class="render-layer render-empty">
                    <div class="render-empty-card">
                      <h3>No visual blocks loaded</h3>
                      <p>
                        Load the demo data to populate the canvas, then use the toolbar to pick a
                        block for inspection.
                      </p>
                      <button type="button" @click=${this.requestDemoData}>Load demo data</button>
                    </div>
                  </div>
                `
              : nothing}
          </div>
        </div>
        <aside class="debug-panel">
          <visual-block-projection-view></visual-block-projection-view>
          <visual-block-inspector-view></visual-block-inspector-view>
          <visual-block-state-debug></visual-block-state-debug>
        </aside>
      </div>
    `;
  }
}
