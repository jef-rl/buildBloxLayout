import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ContextProvider } from '@lit/context';
import { styleMap } from 'lit/directives/style-map.js';
import { consume } from '@lit/context';
import { editorContext, panelStateContext, uiDispatchContext, uiStateContext } from '../../core/state/contexts.ts';
import { DEFAULT_CONTEXT } from '../../core/constants/index.ts';
import type { PanelsState, UiAction, UiDispatch, VisualBlockState } from '../../core/state/ui-state.js';
import { DEFAULT_VISUAL_BLOCK_DATA, serializeVisualBlockData } from '../../core/state/visual-block-data.js';
import '../../shared/components/visual-block/data';
import '../../shared/components/visual-block/grid';
import '../../shared/components/visual-block/render';
import '../../shared/components/visual-block/toolbar';
import '../../shared/components/visual-block/preview';
import '../../shared/components/visual-block/projection';

type PanelVisualMode = 'design' | 'render' | 'preview' | 'projection';

type VisualShellState = {
  zoom: number;
  mode: PanelVisualMode;
  selectedIds: string[];
  interaction: {
    visualGrid: { hoveredId: string | null; ghost: any; marquee: any };
    projection: { dragStart: any };
    modal: { loading: boolean };
  };
};

@customElement('panel-visual-block')
export class PanelVisualBlock extends LitElement {
  @consume({ context: panelStateContext, subscribe: true })
  @property({ attribute: false })
  panelsState?: PanelsState;

  @consume({ context: uiDispatchContext, subscribe: true })
  @property({ attribute: false })
  dispatch?: UiDispatch;

  @property({ type: String })
  mode: PanelVisualMode = 'design';

  @property({ attribute: false })
  data?: Record<string, any>;

  @state()
  private blockData: Record<string, any> = { ...DEFAULT_VISUAL_BLOCK_DATA };

  private lastSerialized = serializeVisualBlockData(this.blockData);

  private editorProvider: ContextProvider;
  private uiProvider: ContextProvider;
  private editorState = { ...DEFAULT_CONTEXT } as Record<string, any>;
  private uiState: VisualShellState = createShellState();

  static styles = css`
    :host {
      display: flex;
      height: 100%;
      width: 100%;
      background: #0b1120;
      color: #e2e8f0;
    }

    .shell {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      position: relative;
    }

    .design-body {
      position: relative;
      flex: 1;
      display: flex;
      overflow: hidden;
      background: #0b1120;
    }

    .canvas {
      position: relative;
      flex: 1;
      overflow: auto;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 32px;
    }

    .canvas-inner {
      position: relative;
      transform-origin: top left;
    }

    .render-only {
      position: relative;
      flex: 1;
      overflow: auto;
      padding: 24px;
      background: #0b1120;
    }

    .render-stage {
      position: relative;
      min-height: 100%;
    }

    .centered {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 40px;
    }
  `;

  constructor() {
    super();
    this.blockData = this.data ? { ...this.data } : { ...DEFAULT_VISUAL_BLOCK_DATA };
    const layoutState = deriveLayoutState(this.blockData);
    this.editorState = {
      ...DEFAULT_CONTEXT,
      ...layoutState,
      blockData: this.blockData,
      selectedIds: [],
      zoom: this.uiState.zoom,
      mode: this.mode === 'design' ? 'design' : 'render',
    };

    this.editorProvider = new ContextProvider(this, {
      context: editorContext,
      initialValue: this.editorState,
    });

    this.uiProvider = new ContextProvider(this, {
      context: uiStateContext,
      initialValue: { state: this.uiState, dispatch: this.dispatchUiAction },
    });
  }

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has('panelsState')) {
      const incoming = this.getVisualBlockState();
      if (incoming?.serializedData && incoming.serializedData !== this.lastSerialized) {
        this.syncBlockData(incoming.data, false);
      }
    }

    if (changedProps.has('data')) {
      this.syncBlockData(this.data ?? DEFAULT_VISUAL_BLOCK_DATA);
    }

    if (changedProps.has('mode')) {
      this.updateShellState({ mode: this.mode });
      this.updateEditorState({ mode: this.mode === 'design' ? 'design' : 'render' });
    }
  }

  private syncBlockData(data: Record<string, any>, persist = true) {
    this.blockData = { ...data };
    this.lastSerialized = serializeVisualBlockData(this.blockData);
    const layoutState = deriveLayoutState(this.blockData);
    this.updateEditorState({
      blockData: this.blockData,
      rects: layoutState.rects,
      gridConfig: layoutState.gridConfig,
      containerSize: layoutState.containerSize,
    });
    if (persist) {
      this.persistVisualBlockState();
    }
  }

  private updateEditorState(partial: Record<string, any>) {
    this.editorState = { ...this.editorState, ...partial };
    this.editorProvider.setValue(this.editorState);
    this.requestUpdate();
  }

  private updateShellState(partial: Partial<VisualShellState>) {
    this.uiState = {
      ...this.uiState,
      ...partial,
      interaction: { ...this.uiState.interaction, ...(partial.interaction ?? {}) },
    };
    this.uiProvider.setValue({ state: this.uiState, dispatch: this.dispatchUiAction });
    this.requestUpdate();
  }

  private updateSelection(selectedIds: string[]) {
    this.updateEditorState({ selectedIds });
    this.updateShellState({ selectedIds });
  }

  private updateZoom(delta: number) {
    const nextZoom = Math.min(2, Math.max(0.5, this.uiState.zoom + delta));
    this.updateEditorState({ zoom: nextZoom });
    this.updateShellState({ zoom: nextZoom });
  }

  private updateRects(updates: Array<{ id: string; rect: Record<string, any> }>) {
    const rects = { ...(this.editorState.rects ?? {}) } as Record<string, any>;
    updates.forEach((update) => {
      rects[update.id] = { ...rects[update.id], ...update.rect };
    });

    const layout = this.blockData.layout_lg ?? {};
    const positions = Array.isArray(layout.positions) ? layout.positions.map((position: any) => {
      const positionId = position._positionID ?? position.id;
      if (!positionId || !rects[positionId]) return position;
      const nextRect = rects[positionId];
      return {
        ...position,
        x: nextRect.x,
        y: nextRect.y,
        w: nextRect.w,
        h: nextRect.h,
        z: nextRect.z,
      };
    }) : [];

    this.blockData = {
      ...this.blockData,
      layout_lg: {
        ...layout,
        positions,
      },
    };

    const layoutState = deriveLayoutState(this.blockData, rects);
    this.updateEditorState({
      rects: layoutState.rects,
      gridConfig: layoutState.gridConfig,
      containerSize: layoutState.containerSize,
      blockData: this.blockData,
    });
    this.persistVisualBlockState();
  }

  private handleUiEvent(event: CustomEvent<{ type?: string; payload?: unknown }>) {
    const { type, payload } = event.detail ?? {};
    if (!type) return;

    switch (type) {
      case 'selection-change': {
        const selectedIds = Array.isArray(payload) ? payload : [];
        this.updateSelection(selectedIds as string[]);
        event.stopPropagation();
        break;
      }
      case 'rect-update': {
        const updates = Array.isArray(payload) ? payload : [];
        this.updateRects(updates as Array<{ id: string; rect: Record<string, any> }>);
        event.stopPropagation();
        break;
      }
      case 'projection-rotate':
        this.updateEditorState({ rotationY: payload ?? 0 });
        event.stopPropagation();
        break;
      case 'zoom-in':
        this.updateZoom(0.1);
        event.stopPropagation();
        break;
      case 'zoom-out':
        this.updateZoom(-0.1);
        event.stopPropagation();
        break;
      case 'mode-change':
        if (payload === 'design' || payload === 'render') {
          this.mode = payload as PanelVisualMode;
          this.updateShellState({ mode: this.mode });
          this.updateEditorState({ mode: this.mode });
          event.stopPropagation();
        }
        break;
      default:
        break;
    }
  }

  private dispatchUiAction = (action: UiAction) => {
    if (!action?.type) return;
    const interaction = this.uiState.interaction;

    switch (action.type) {
      case 'visual-grid/hover':
        this.updateShellState({
          interaction: {
            ...interaction,
            visualGrid: { ...interaction.visualGrid, hoveredId: action.hoveredId ?? null },
          },
        });
        break;
      case 'visual-grid/drag-start':
        this.updateShellState({
          interaction: {
            ...interaction,
            visualGrid: { ...interaction.visualGrid, ghost: action.ghost ?? null, marquee: action.marquee ?? null },
          },
        });
        break;
      case 'visual-grid/drag-update':
        this.updateShellState({
          interaction: {
            ...interaction,
            visualGrid: {
              ...interaction.visualGrid,
              ghost: action.ghost !== undefined ? action.ghost : interaction.visualGrid.ghost,
              marquee: action.marquee !== undefined ? action.marquee : interaction.visualGrid.marquee,
            },
          },
        });
        break;
      case 'visual-grid/drag-end':
        this.updateShellState({
          interaction: {
            ...interaction,
            visualGrid: { ...interaction.visualGrid, ghost: null, marquee: null },
          },
        });
        break;
      case 'projection/drag-start':
        this.updateShellState({
          interaction: {
            ...interaction,
            projection: { dragStart: action.dragStart ?? null },
          },
        });
        break;
      case 'projection/drag-end':
        this.updateShellState({
          interaction: {
            ...interaction,
            projection: { dragStart: null },
          },
        });
        break;
      case 'modal/loading':
        this.updateShellState({
          interaction: {
            ...interaction,
            modal: { loading: action.loading ?? false },
          },
        });
        break;
      default:
        break;
    }
  };

  private renderDesign() {
    const zoomStyle = { transform: `scale(${this.uiState.zoom})` };
    return html`
      <div class="shell" @ui-event=${this.handleUiEvent}>
        <visual-block-toolbar></visual-block-toolbar>
        <div class="design-body">
          <div class="canvas">
            <div class="canvas-inner" style=${styleMap(zoomStyle)}>
              <visual-block-render></visual-block-render>
              <visual-block-grid></visual-block-grid>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderRenderOnly() {
    return html`
      <div class="shell" @ui-event=${this.handleUiEvent}>
        <div class="render-only">
          <div class="render-stage">
            <visual-block-render></visual-block-render>
          </div>
        </div>
      </div>
    `;
  }

  private renderPreview() {
    return html`
      <div class="shell" @ui-event=${this.handleUiEvent}>
        <div class="centered">
          <visual-block-preview></visual-block-preview>
        </div>
      </div>
    `;
  }

  private renderProjection() {
    return html`
      <div class="shell" @ui-event=${this.handleUiEvent}>
        <div class="centered">
          <visual-block-projection></visual-block-projection>
        </div>
      </div>
    `;
  }

  render() {
    const content =
      this.mode === 'design'
        ? this.renderDesign()
        : this.mode === 'render'
          ? this.renderRenderOnly()
          : this.mode === 'preview'
            ? this.renderPreview()
            : this.mode === 'projection'
              ? this.renderProjection()
              : nothing;

    return html`
      <visual-block-data .data=${this.blockData}>
        ${content}
      </visual-block-data>
    `;
  }

  private getVisualBlockState(): VisualBlockState | undefined {
    return this.panelsState?.data?.['visual-editor']?.visualBlockState;
  }

  private persistVisualBlockState() {
    if (!this.dispatch) return;
    const nextSerialized = serializeVisualBlockData(this.blockData);
    this.lastSerialized = nextSerialized;
    this.dispatch({
      type: 'panel/update',
      panelId: 'visual-editor',
      data: {
        visualBlockState: {
          data: { ...this.blockData },
          serializedData: nextSerialized,
          renderOutput: this.getVisualBlockState()?.renderOutput ?? '',
        },
      },
    });
  }
}

function createShellState(): VisualShellState {
  return {
    zoom: 1,
    mode: 'design',
    selectedIds: [],
    interaction: {
      visualGrid: { hoveredId: null, ghost: null, marquee: null },
      projection: { dragStart: null },
      modal: { loading: false },
    },
  };
}

function deriveLayoutState(blockData: Record<string, any>, overrideRects?: Record<string, any>) {
  const layout = blockData.layout_lg ?? {};
  const columns = Number(layout.columns ?? DEFAULT_CONTEXT.gridConfig.columns);
  const rowHeight = Number(layout.rowHeight ?? DEFAULT_CONTEXT.gridConfig.rowHeight);
  const padding = Number(layout.padding ?? DEFAULT_CONTEXT.gridConfig.padding);
  const stepX = Number(layout.stepX ?? DEFAULT_CONTEXT.gridConfig.stepX);
  const stepY = Number(layout.stepY ?? DEFAULT_CONTEXT.gridConfig.stepY);
  const positions = Array.isArray(layout.positions) ? layout.positions : [];

  const rects = overrideRects ?? positions.reduce<Record<string, any>>((acc, position, index) => {
    const id = position._positionID ?? position.id ?? `pos-${index + 1}`;
    acc[id] = {
      id,
      x: position.x ?? 0,
      y: position.y ?? 0,
      w: position.w ?? 1,
      h: position.h ?? 1,
      z: position.z ?? index,
      contentID: position._contentID ?? position.contentID,
    };
    return acc;
  }, {});

  const maxRowIndex = Object.values(rects).reduce((max, rect: any) => Math.max(max, rect.y + rect.h), 1);

  return {
    rects,
    gridConfig: {
      columns,
      rowHeight,
      padding,
      stepX,
      stepY,
      gutter: layout.gutter ?? DEFAULT_CONTEXT.gridConfig.gutter,
      mode: layout.mode ?? DEFAULT_CONTEXT.gridConfig.mode,
    },
    containerSize: {
      width: columns * stepX + padding * 2,
      height: maxRowIndex * rowHeight + padding * 2,
    },
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'panel-visual-block': PanelVisualBlock;
  }
}
