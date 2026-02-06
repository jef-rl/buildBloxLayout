import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { styleMap } from 'lit/directives/style-map.js';
import { coreContext, type CoreContext } from '@project/framework/nxt';
import type { UIState } from '@project/framework';
import type { VisualBlockUiStateDto } from '../dto/visual-block-ui-state.dto';
import type { VisualBlockRectDto } from '../dto/visual-block-rect.dto';
import type { VisualBlockRenderModel } from '../selectors/visual-block-render-model.selector';
import { visualBlockRenderModelSelectorKey } from '../selectors/visual-block-render-model.selector';
import { visualBlockUiSelectorKey } from '../selectors/visual-block-ui.selector';
import { VisualBlockActionCatalog } from '../visual-block-action-catalog';
import {
  updateRectsOnDrag,
  updateRectsOnResize,
  updateSelectionOnClick,
  type DragDelta,
  type ResizeHandle,
} from '../grid/grid-editing-reducer';

type InteractionState = {
  type: 'drag' | 'resize';
  startPointer: { x: number; y: number };
  startRects: VisualBlockRectDto[];
  selectionIds: string[];
  handle?: ResizeHandle;
  hasMoved: boolean;
};

@customElement('visual-block-grid-overlay')
export class VisualBlockGridOverlay extends LitElement {
  @consume({ context: coreContext, subscribe: true })
  core?: CoreContext<UIState>;

  static styles = css`
    :host {
      position: absolute;
      inset: 0;
      display: block;
      pointer-events: auto;
      touch-action: none;
    }
    .overlay-grid {
      width: 100%;
      height: 100%;
      display: grid;
      position: relative;
      box-sizing: border-box;
    }
    .wireframe {
      position: relative;
      border: 1px solid rgba(59, 130, 246, 0.35);
      box-sizing: border-box;
      background: rgba(59, 130, 246, 0.05);
      pointer-events: auto;
    }
    .wireframe.selected {
      border-color: rgba(59, 130, 246, 0.9);
      background: rgba(59, 130, 246, 0.12);
    }
    .handle {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #2563eb;
      border-radius: 2px;
      transform: translate(-50%, -50%);
      pointer-events: auto;
    }
    .handle.n {
      top: 0%;
      left: 50%;
      cursor: ns-resize;
    }
    .handle.s {
      top: 100%;
      left: 50%;
      cursor: ns-resize;
    }
    .handle.e {
      top: 50%;
      left: 100%;
      cursor: ew-resize;
    }
    .handle.w {
      top: 50%;
      left: 0%;
      cursor: ew-resize;
    }
    .handle.ne {
      top: 0%;
      left: 100%;
      cursor: nesw-resize;
    }
    .handle.nw {
      top: 0%;
      left: 0%;
      cursor: nwse-resize;
    }
    .handle.se {
      top: 100%;
      left: 100%;
      cursor: nwse-resize;
    }
    .handle.sw {
      top: 100%;
      left: 0%;
      cursor: nesw-resize;
    }
  `;

  private interaction: InteractionState | null = null;
  private previewRects: VisualBlockRectDto[] | null = null;

  private getRenderModel(): VisualBlockRenderModel | null {
    return this.core?.select<VisualBlockRenderModel>(visualBlockRenderModelSelectorKey) ?? null;
  }

  private getSelection(): string[] {
    return this.core?.select<{ selectedIds: string[] }>(visualBlockUiSelectorKey)?.selectedIds ?? [];
  }

  private getUiState(): VisualBlockUiStateDto | null {
    return this.core?.select<VisualBlockUiStateDto>(visualBlockUiSelectorKey) ?? null;
  }

  private updateSelection(selectedIds: string[]): void {
    this.core?.dispatch({
      action: VisualBlockActionCatalog.VisualBlockUiPatch,
      payload: {
        ui: {
          selectedIds,
        },
      },
    });
  }

  private updateRects(rects: VisualBlockRectDto[], model: VisualBlockRenderModel): void {
    if (!model.layoutId || !model.layout) {
      return;
    }

    const rectMap = rects.reduce<Record<string, VisualBlockRectDto>>((acc, rect) => {
      acc[rect._positionID] = rect;
      return acc;
    }, {});

    this.core?.dispatch({
      action: VisualBlockActionCatalog.VisualBlockDataPatch,
      payload: {
        data: {
          layouts: {
            [model.layoutId]: {
              ...model.layout,
              positions: rects,
            },
          },
          rects: rectMap,
        },
      },
    });
  }

  private resolvePointerPosition(event: PointerEvent): { x: number; y: number } {
    const rect = this.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  private resolveGridDelta(
    start: { x: number; y: number },
    current: { x: number; y: number },
    model: VisualBlockRenderModel,
  ): DragDelta {
    const rect = this.getBoundingClientRect();
    const padding = model.padding;
    const width = Math.max(0, rect.width - padding * 2);
    const stepX = model.columns > 0 ? width / model.columns : 0;
    const stepY = model.rowHeight;
    const dx = stepX > 0 ? Math.round((current.x - start.x) / stepX) : 0;
    const dy = stepY > 0 ? Math.round((current.y - start.y) / stepY) : 0;
    return { dx, dy };
  }

  private resolveHandle(eventPath: EventTarget[]): ResizeHandle | null {
    const handleEl = eventPath.find(
      (el) => el instanceof HTMLElement && el.dataset.handle,
    ) as HTMLElement | undefined;
    if (!handleEl) {
      return null;
    }
    const handle = handleEl.dataset.handle as ResizeHandle | undefined;
    return handle ?? null;
  }

  private resolveWireframeId(eventPath: EventTarget[]): string | null {
    const wireframeEl = eventPath.find(
      (el) => el instanceof HTMLElement && el.dataset.id,
    ) as HTMLElement | undefined;
    return wireframeEl?.dataset.id ?? null;
  }

  private handlePointerDown(event: PointerEvent): void {
    const uiState = this.getUiState();
    if (uiState?.mode && uiState.mode !== 'design') {
      return;
    }

    const model = this.getRenderModel();
    if (!model || model.rects.length === 0) {
      return;
    }
    const uiSelection = this.getSelection();
    const path = event.composedPath();
    const handle = this.resolveHandle(path);
    const clickedId = this.resolveWireframeId(path);
    const modifiers = { isMulti: event.metaKey || event.ctrlKey || event.shiftKey };

    event.preventDefault();

    let nextSelection = uiSelection;
    let interactionType: InteractionState['type'] | null = null;

    if (handle && clickedId) {
      nextSelection = [clickedId];
      interactionType = 'resize';
    } else if (clickedId) {
      nextSelection = updateSelectionOnClick(uiSelection, clickedId, modifiers);
      interactionType = 'drag';
    } else {
      nextSelection = updateSelectionOnClick(uiSelection, null, modifiers);
    }

    if (!arraysEqual(uiSelection, nextSelection)) {
      this.updateSelection(nextSelection);
    }

    if (interactionType && clickedId) {
      this.setPointerCapture(event.pointerId);
      this.interaction = {
        type: interactionType,
        startPointer: this.resolvePointerPosition(event),
        startRects: model.rects.map((rect) => ({ ...rect })),
        selectionIds: nextSelection,
        handle: handle ?? undefined,
        hasMoved: false,
      };
      this.previewRects = null;
    } else {
      this.interaction = null;
      this.previewRects = null;
    }
  }

  private handlePointerMove(event: PointerEvent): void {
    if (!this.interaction) {
      return;
    }

    const model = this.getRenderModel();
    if (!model) {
      return;
    }

    const current = this.resolvePointerPosition(event);
    const delta = this.resolveGridDelta(this.interaction.startPointer, current, model);

    const nextRects =
      this.interaction.type === 'drag'
        ? updateRectsOnDrag(
            this.interaction.startRects,
            this.interaction.selectionIds,
            delta,
            { columns: model.columns },
          )
        : updateRectsOnResize(
            this.interaction.startRects,
            this.interaction.selectionIds,
            { ...delta, handle: this.interaction.handle ?? 'se' },
            { columns: model.columns },
          );

    if (delta.dx !== 0 || delta.dy !== 0) {
      this.interaction.hasMoved = true;
    }
    this.previewRects = nextRects;
    this.requestUpdate();
  }

  private handlePointerUp(event: PointerEvent): void {
    if (!this.interaction) {
      return;
    }

    const model = this.getRenderModel();
    if (!model) {
      this.interaction = null;
      this.previewRects = null;
      return;
    }

    const finalRects = this.previewRects ?? this.interaction.startRects;
    if (this.interaction.hasMoved && !rectsEqual(finalRects, this.interaction.startRects)) {
      this.updateRects(finalRects, model);
    }

    this.releasePointerCapture(event.pointerId);
    this.interaction = null;
    this.previewRects = null;
  }

  private handlePointerCancel(event: PointerEvent): void {
    if (this.interaction) {
      this.releasePointerCapture(event.pointerId);
    }
    this.interaction = null;
    this.previewRects = null;
  }

  private renderWireframe(rect: VisualBlockRectDto, selected: boolean): TemplateResult {
    const style = {
      gridColumnStart: `${rect.x + 1}`,
      gridColumnEnd: `span ${rect.w}`,
      gridRowStart: `${rect.y + 1}`,
      gridRowEnd: `span ${rect.h}`,
    };

    return html`
      <div class="wireframe ${selected ? 'selected' : ''}" data-id=${rect._positionID} style=${styleMap(style)}>
        ${selected
          ? HANDLE_ORDER.map(
              (handle) => html`<div class="handle ${handle}" data-handle=${handle}></div>`,
            )
          : nothing}
      </div>
    `;
  }

  render() {
    const model = this.getRenderModel();
    if (!model) {
      return html`${nothing}`;
    }

    const selection = new Set(this.getSelection());
    const rects = this.previewRects ?? model.rects;

    const overlayStyle = {
      gridTemplateColumns: `repeat(${model.columns}, 1fr)`,
      gridTemplateRows: `repeat(${model.rowCount}, ${model.rowHeight}px)`,
      padding: `${model.padding}px`,
      boxSizing: 'border-box',
    };

    return html`
      <div
        class="overlay-grid"
        style=${styleMap(overlayStyle)}
        @pointerdown=${this.handlePointerDown}
        @pointermove=${this.handlePointerMove}
        @pointerup=${this.handlePointerUp}
        @pointercancel=${this.handlePointerCancel}
      >
        ${rects.map((rect) => this.renderWireframe(rect, selection.has(rect._positionID)))}
      </div>
    `;
  }
}

const HANDLE_ORDER: ResizeHandle[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

const arraysEqual = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((value, index) => value === right[index]);
};

const rectsEqual = (left: VisualBlockRectDto[], right: VisualBlockRectDto[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }
  const byId = new Map(left.map((rect) => [rect._positionID, rect]));
  return right.every((rect) => {
    const match = byId.get(rect._positionID);
    if (!match) {
      return false;
    }
    return match.x === rect.x && match.y === rect.y && match.w === rect.w && match.h === rect.h;
  });
};
