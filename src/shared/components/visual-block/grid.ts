import { LitElement, html, css } from 'lit';
import { ContextConsumer } from '@lit/context';
import { styleMap } from 'lit/directives/style-map.js';
import { editorContext, uiStateContext } from '../contexts.ts';
import { DEFAULT_CONTEXT } from '../defaults.js';
import { clampGrid } from '../utils/grid.js';
import type { UiDispatch, UiStateContextValue, VisualGridGhost, VisualGridMarquee } from '../../../core/state/ui-state.js';

/**
 * <visual-block-grid>
 *
 * Responsibility:
 * - The edit overlay: selection, drag-move, resize, z-index wheel.
 * - Marquee selection (click-drag on background).
 * - Never mutates layout directly. Emits `rect-update` with patches.
 */
export class VisualBlockGrid extends LitElement {
  private contextState: any = DEFAULT_CONTEXT;
  private _consumer = new ContextConsumer(this, {
    context: editorContext,
    subscribe: true,
    callback: (value) => {
      this.contextState = value ?? DEFAULT_CONTEXT;
      this.requestUpdate();
    },
  });

  private uiState: UiStateContextValue['state'] | null = null;
  private uiDispatch?: UiDispatch;
  private _uiConsumer = new ContextConsumer(this, {
    context: uiStateContext,
    subscribe: true,
    callback: (value: UiStateContextValue | undefined) => {
      this.uiState = value?.state ?? this.uiState;
      this.uiDispatch = value?.dispatch ?? this.uiDispatch;
      this.requestUpdate();
    },
  });

  private handleWindowMouseMove = (e: MouseEvent) => this._handleWindowMouseMove(e);
  private handleWindowMouseUp = (e: MouseEvent) => this._handleWindowMouseUp(e);
  private handleGridMouseDown = (e: MouseEvent) => this._handleGridMouseDown(e); 
  private handleWheel = (e: WheelEvent) => this._handleWheel(e);
  private handleHoverEnter = (id: string) => this._handleHover(id);
  private handleHoverLeave = () => this._handleHover(null);

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mousemove', this.handleWindowMouseMove, { passive: false });
    window.addEventListener('mouseup', this.handleWindowMouseUp, { passive: false });
    this.addEventListener('wheel', this.handleWheel, { passive: false });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mousemove', this.handleWindowMouseMove);
    window.removeEventListener('mouseup', this.handleWindowMouseUp);
    this.removeEventListener('wheel', this.handleWheel);
  }

  private dispatchUiEvent(type: string, payload: any = null) {
    this.dispatchEvent(new CustomEvent('ui-event', { detail: { type, payload }, bubbles: true, composed: true }));
  }

  private dispatchInteraction(action: Parameters<UiDispatch>[0]) {
    this.uiDispatch?.(action);
  }

  private _handleHover(hoveredId: string | null) {
    this.dispatchInteraction({ type: 'visual-grid/hover', hoveredId });
  }

  private getVisualGridState() {
    return this.uiState?.interaction?.visualGrid ?? { hoveredId: null, ghost: null, marquee: null };
  }

  private getMouseCoords(e: MouseEvent) {
    const rect = this.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / this.contextState.zoom, y: (e.clientY - rect.top) / this.contextState.zoom };
  }

  private getGridCoords(x: number, y: number) {
    const { padding, stepX, stepY } = this.contextState.gridConfig;
    return { gridX: Math.floor((x - padding) / stepX), gridY: Math.floor((y - padding) / stepY) };
  }

  private _handleWheel(e: WheelEvent) {
    const { mode, selectedIds, rects } = this.contextState;
    if (mode !== 'design' || !selectedIds?.length) return;

    e.preventDefault();
    e.stopPropagation();

    const isIncreasing = e.deltaY > 0; // Wheel down = backward (increase Z if we think of 0 as front? No, usually higher Z is front.)
    // Wait, CSS Z-index: Higher is closer to user (Front). Lower is Back.
    // User wants: Wheel Up -> Decrease Z (Send Backward). Wheel Down -> Increase Z (Bring Forward).
    // Let's stick to standard: deltaY > 0 (scrolling down) -> usually associated with "next" or "down".
    // If Z-axis goes out of screen, "down" could mean "back".
    // Let's assume: deltaY > 0 => Move Backward (Decrease Z). deltaY < 0 => Move Forward (Increase Z).
    // RE-READING previous logic:
    // "const isIncreasing = e.deltaY > 0; // Wheel down = increase Z" was used.
    // Let's assume the user was okay with the direction, just the logic was wrong.
    // But typically scrolling "down" moves things "away"?
    // I will stick to the previous direction mapping: deltaY > 0 = Increase Z (Forward).

    // 1. Identify the overlapping stack relative to the selection
    const anchorId = selectedIds[0];
    const anchorRect = rects[anchorId];
    if (!anchorRect) return;

    const allRects = Object.values(rects) as any[];
    // Filter to ONLY those rectangles that intersect with our anchor
    const stackRects = allRects.filter(r => {
        return r.x < anchorRect.x + anchorRect.w &&
               r.x + r.w > anchorRect.x &&
               r.y < anchorRect.y + anchorRect.h &&
               r.y + r.h > anchorRect.y;
    }).sort((a, b) => (a.z || 0) - (b.z || 0));

    const selectedInStack = stackRects.filter(r => selectedIds.includes(r.id));
    if (selectedInStack.length === 0) return;

    // Use global Z-sorted list for actual reordering to preserve relative order of non-overlapping items
    const globalSorted = allRects.sort((a, b) => (a.z || 0) - (b.z || 0));
    const updates: any[] = [];

    if (isIncreasing) {
      // Move Forward (Increase Z)
      const highestSelected = selectedInStack[selectedInStack.length - 1];
      const highestIdxInStack = stackRects.findIndex(r => r.id === highestSelected.id);
      
      if (highestIdxInStack < stackRects.length - 1) {
        const targetRect = stackRects[highestIdxInStack + 1]; // The item directly above in the stack
        
        // Find positions in the GLOBAL list
        const targetGlobalIdx = globalSorted.findIndex(r => r.id === targetRect.id);
        
        // We want to move all selected items to be immediately AFTER targetRect in the global list
        const selectedIdsSet = new Set(selectedIds);
        const nonSelectedGlobal = globalSorted.filter(r => !selectedIdsSet.has(r.id));
        
        // Find where target is in the non-selected list (it must be there)
        const targetIndexInNonSelected = nonSelectedGlobal.findIndex(r => r.id === targetRect.id);
        
        // Insert selected items after target
        const newGlobalOrder = [
            ...nonSelectedGlobal.slice(0, targetIndexInNonSelected + 1),
            ...selectedInStack, // Use the selected items from the stack (or all selected? usually we move all selected)
            // Wait, if we have multi-selection, we should move all selected items together?
            // The prompt implies moving "S" (selection).
            // Let's assume we move all currently selected IDs.
            ...globalSorted.filter(r => selectedIdsSet.has(r.id) && !selectedInStack.find(s => s.id === r.id)), // Add any selected not in stack?
            // Actually, simply: Remove selected from global, Insert them after target.
            ...nonSelectedGlobal.slice(targetIndexInNonSelected + 1)
        ];
        
        // Wait, if we just pull selected items out and put them after target, we might mess up order 
        // if some selected items were already far ahead.
        // But for a rigid "swap", we usually group them.
        
        // Let's refine: We only want to swap the *subset* of selected items that are in this specific stack configuration?
        // Usually Z-index moves apply to the whole selection.
        // Let's do: Pull all `selectedIds` out of `globalSorted`.
        // Insert them immediately after `targetRect`.
        
        const selectionGroup = globalSorted.filter(r => selectedIds.includes(r.id));
        const everythingElse = globalSorted.filter(r => !selectedIds.includes(r.id));
        
        const insertionPoint = everythingElse.findIndex(r => r.id === targetRect.id);
        
        const finalOrder = [
            ...everythingElse.slice(0, insertionPoint + 1),
            ...selectionGroup,
            ...everythingElse.slice(insertionPoint + 1)
        ];
        
        // Re-assign Z-indices
        finalOrder.forEach((r, i) => {
            updates.push({ id: r.id, rect: { ...r, z: i } });
        });
      }
    } else {
      // Move Backward (Decrease Z)
      const lowestSelected = selectedInStack[0];
      const lowestIdxInStack = stackRects.findIndex(r => r.id === lowestSelected.id);
      
      if (lowestIdxInStack > 0) {
        const targetRect = stackRects[lowestIdxInStack - 1]; // The item directly below in the stack
        
        const selectionGroup = globalSorted.filter(r => selectedIds.includes(r.id));
        const everythingElse = globalSorted.filter(r => !selectedIds.includes(r.id));
        
        const insertionPoint = everythingElse.findIndex(r => r.id === targetRect.id);
        
        // Insert selected items BEFORE target
        const finalOrder = [
            ...everythingElse.slice(0, insertionPoint),
            ...selectionGroup,
            ...everythingElse.slice(insertionPoint)
        ];
        
        finalOrder.forEach((r, i) => {
            updates.push({ id: r.id, rect: { ...r, z: i } });
        });
      }
    }

    if (updates.length) {
      this.dispatchUiEvent('rect-update', updates);
    }
  }

  private _handleGridMouseDown(e: MouseEvent) {
    const { mode, selectedIds, rects } = this.contextState;
    if (mode !== 'design') return;

    e.stopPropagation();
    e.preventDefault();

    const { x, y } = this.getMouseCoords(e);
    const { gridX, gridY } = this.getGridCoords(x, y);

    const path = e.composedPath();
    let primaryIdToSelect: string | null = null;
    let interactionType: 'MOVE' | 'RESIZE' | 'MARQUEE' = 'MARQUEE';
    let resizeDirection: string | undefined;

    // 1. Check if a resize handle was clicked
    const clickedHandle = path.find((el: EventTarget) => (el instanceof Element) && el.classList.contains('handle')) as (Element | undefined);
    if (clickedHandle) {
        const wireframeElement = path.find((el: EventTarget) => (el instanceof Element) && el.classList.contains('wireframe')) as (HTMLElement | undefined);
        if (wireframeElement && wireframeElement.dataset.id) {
            primaryIdToSelect = wireframeElement.dataset.id;
            interactionType = 'RESIZE';
            resizeDirection = Array.from(clickedHandle.classList).find(cls => cls !== 'handle');
        }
    }

    // 2. If no handle, check if a wireframe was clicked (Z-index aware)
    if (!primaryIdToSelect) {
        const hitRects = Object.values(rects)
          .filter((r: any) => gridX >= r.x && gridX < r.x + r.w && gridY >= r.y && gridY < r.y + r.h)
          .sort((a: any, b: any) => (b.z || 0) - (a.z || 0)) as any[]; // Sort DESCENDING Z
        
        if (hitRects.length > 0) {
            const alreadySelectedHit = hitRects.find(r => selectedIds.includes(r.id));
            if (alreadySelectedHit) {
                 primaryIdToSelect = alreadySelectedHit.id;
            } else {
                 primaryIdToSelect = hitRects[0].id; // Topmost rect by Z-index
            }
            interactionType = 'MOVE';
        }
    }

    const originalSelectedIds = [...(selectedIds ?? [])];

    // Update selection based on interaction type and modifier keys
    let newSelection: string[] = [...originalSelectedIds];
    if (interactionType === 'MOVE' && primaryIdToSelect) {
        if (e.ctrlKey || e.metaKey || e.shiftKey) {
            if (newSelection.includes(primaryIdToSelect)) newSelection = newSelection.filter((id) => id !== primaryIdToSelect);
            else newSelection.push(primaryIdToSelect);
        } else if (!newSelection.includes(primaryIdToSelect)) {
            newSelection = [primaryIdToSelect];
        }
    } else if (interactionType === 'RESIZE' && primaryIdToSelect) {
        newSelection = [primaryIdToSelect];
    } else if (interactionType === 'MARQUEE') {
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
            newSelection = []; 
        }
    }

    this.dispatchUiEvent('selection-change', newSelection);

    if (interactionType === 'MARQUEE') {
        this.dispatchInteraction({ type: 'visual-grid/drag-start', ghost: null, marquee: { x1: x, y1: y, x2: x, y2: y } });
    } else if (primaryIdToSelect) {
        const ghostItems: any = {};
        newSelection.forEach((id) => {
            if (rects[id]) ghostItems[id] = { originalRect: { ...rects[id] }, currentRect: { ...rects[id] } };
        });

        const ghost: VisualGridGhost = {
            primaryId: primaryIdToSelect,
            originalSelectedIds, 
            type: interactionType,
            resizeDir: resizeDirection,
            startMouse: { x, y },
            items: ghostItems,
            wasDragged: false,
        };
        this.dispatchInteraction({ type: 'visual-grid/drag-start', ghost, marquee: null });
    } else {
        this.dispatchInteraction({ type: 'visual-grid/drag-end' });
    }
  }

  private _handleWindowMouseMove(e: MouseEvent) {
    const { marquee, ghost } = this.getVisualGridState();

    if (marquee) {
        const { x, y } = this.getMouseCoords(e);
        this.dispatchInteraction({ type: 'visual-grid/drag-update', marquee: { ...marquee, x2: x, y2: y } });
        return;
    }

    if (!ghost) return;

    const { gridConfig } = this.contextState;
    const { x, y } = this.getMouseCoords(e);

    const deltaX = x - ghost.startMouse.x;
    const deltaY = y - ghost.startMouse.y;

    const wasDragged = ghost.wasDragged || Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2;

    const gridDeltaX = Math.round(deltaX / gridConfig.stepX);
    const gridDeltaY = Math.round(deltaY / gridConfig.stepY);

    if (ghost.type === 'MOVE') {
      let constrainedDeltaX = gridDeltaX;
      let constrainedDeltaY = gridDeltaY;

      // Group bounding box calculation
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      Object.keys(ghost.items).forEach(id => {
          const orig = ghost.items[id].originalRect;
          minX = Math.min(minX, orig.x);
          minY = Math.min(minY, orig.y);
          maxX = Math.max(maxX, orig.x + orig.w);
          maxY = Math.max(maxY, orig.y + orig.h);
      });

      // Clamp DeltaX based on group boundaries
      if (minX + constrainedDeltaX < 0) constrainedDeltaX = -minX;
      if (maxX + constrainedDeltaX > gridConfig.columns) constrainedDeltaX = gridConfig.columns - maxX;

      // Clamp DeltaY (Top only)
      if (minY + constrainedDeltaY < 0) constrainedDeltaY = -minY;

      const updatedItems = Object.keys(ghost.items).reduce<Record<string, VisualGridGhost['items'][string]>>((acc, id) => {
        const item = ghost.items[id];
        const orig = item.originalRect;
        acc[id] = { ...item, currentRect: { ...orig, x: orig.x + constrainedDeltaX, y: orig.y + constrainedDeltaY } };
        return acc;
      }, {});

      this.dispatchInteraction({ type: 'visual-grid/drag-update', ghost: { ...ghost, wasDragged, items: updatedItems } });
      return;
    }

    if (ghost.type === 'RESIZE') {
      const dir = ghost.resizeDir || 'se';
      const orig = ghost.items[ghost.primaryId].originalRect;

      let newW = orig.w, newH = orig.h, newX = orig.x, newY = orig.y;

      if (dir.includes('e')) newW = Math.max(1, orig.w + gridDeltaX);
      else if (dir.includes('w')) {
        const diff = Math.min(orig.w - 1, gridDeltaX);
        newW = orig.w - diff;
        newX = orig.x + diff;
      }

      if (dir.includes('s')) newH = Math.max(1, orig.h + gridDeltaY);
      else if (dir.includes('n')) {
        const diff = Math.min(orig.h - 1, gridDeltaY);
        newH = orig.h - diff;
        newY = orig.y + diff;
      }

      const constrained = clampGrid({ x: newX, y: newY, w: newW, h: newH }, gridConfig.columns);
      const updatedItems = {
        ...ghost.items,
        [ghost.primaryId]: { ...ghost.items[ghost.primaryId], currentRect: { ...orig, ...constrained } },
      };

      this.dispatchInteraction({ type: 'visual-grid/drag-update', ghost: { ...ghost, wasDragged, items: updatedItems } });
    }
  }

  private _handleWindowMouseUp(e: MouseEvent) {
    const { rects, selectedIds, gridConfig } = this.contextState;
    const { marquee, ghost } = this.getVisualGridState();

    if (marquee) {
        const { x1, y1, x2, y2 } = marquee;
        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);
        const width = Math.abs(x1 - x2);
        const height = Math.abs(y1 - y2);
        
        const { padding, stepX, stepY } = gridConfig;
        
        const newlySelected: string[] = e.ctrlKey || e.metaKey || e.shiftKey ? [...selectedIds] : [];
        
        if (width > 2 || height > 2) {
            Object.values(rects).forEach((r: any) => {
                const rLeft = padding + r.x * stepX;
                const rTop = padding + r.y * stepY;
                const rRight = rLeft + r.w * stepX;
                const rBottom = rTop + r.h * stepY;
                
                // Check for intersection
                if (rLeft < (left + width) && rRight > left && rTop < (top + height) && rBottom > top) {
                    if (!newlySelected.includes(r.id)) {
                        newlySelected.push(r.id);
                    }
                }
            });
            this.dispatchUiEvent('selection-change', newlySelected);
        }

        this.dispatchInteraction({ type: 'visual-grid/drag-end' });
        return;
    }

    if (!ghost) return;

    if (ghost.type === 'MOVE') {
      if (!ghost.wasDragged) { // This was a simple click (no drag)
        const { x, y } = ghost.startMouse;
        const { gridX, gridY } = this.getGridCoords(x, y);

        // Get all items at the clicked location, sorted by Z (DESCENDING - top to bottom)
        const hitRects = Object.values(rects)
          .filter((r: any) => gridX >= r.x && gridX < r.x + r.w && gridY >= r.y && gridY < r.y + r.h)
          .sort((a: any, b: any) => (b.z || 0) - (a.z || 0)) as any[];

        if (hitRects.length > 0) {
          let newSelection: string[] = [...(selectedIds ?? [])];
          
          // Use the selection that was active at the START of the mousedown
          // This allows us to cycle relative to what was selected, not just what we "clicked" on in mousedown
          const currentlySelectedId = ghost.primaryId;

          if (e.ctrlKey || e.metaKey || e.shiftKey) {
            // Toggle selection logic already performed in mousedown, no change needed for click
          } else { 
            // Cycling logic: Only cycle if the click happened on an element that was ALREADY selected
            // before the current mousedown started.
            const wasAlreadySelected = ghost.originalSelectedIds.includes(currentlySelectedId);

            if (wasAlreadySelected) {
                const currentIndexInHitRects = hitRects.findIndex((r: any) => r.id === currentlySelectedId);
                const nextIndex = (currentIndexInHitRects + 1) % hitRects.length;
                newSelection = [hitRects[nextIndex].id];
                this.dispatchUiEvent('selection-change', newSelection);
            }
          }
        } else {
          // If clicked on nothing and no drag, clear selection unless modifier held
          if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
            this.dispatchUiEvent('selection-change', []);
          }
        }
      } else { // Was a drag move
        const updates = Object.keys(ghost.items).map((id) => ({ id, rect: ghost.items[id].currentRect }));
        this.dispatchUiEvent('rect-update', updates);
      }
    }

    if (ghost.type === 'RESIZE' && ghost.wasDragged) {
      const updates = Object.keys(ghost.items).map((id) => ({ id, rect: ghost.items[id].currentRect }));
      this.dispatchUiEvent('rect-update', updates);
    }

    this.dispatchInteraction({ type: 'visual-grid/drag-end' });
  }

  render() {
    const { rects, selectedIds, mode, gridConfig } = this.contextState;
    const { hoveredId, ghost, marquee } = this.getVisualGridState();
    if (!rects || Object.keys(rects).length === 0) return html``;
    if (mode !== 'design') return html``;

    const { columns, rowHeight, padding } = gridConfig;

    // Determine max row count by checking rects AND active ghost rects
    let maxRowIndex = 0;
    Object.values(rects).forEach((r: any) => (maxRowIndex = Math.max(maxRowIndex, r.y + r.h)));
    if (ghost?.items) {
      Object.values(ghost.items).forEach((item: any) => (maxRowIndex = Math.max(maxRowIndex, item.currentRect.y + item.currentRect.h)));
    }
    const rowCount = maxRowIndex > 0 ? maxRowIndex : 52;

    const gridOverlayStyle: any = {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridTemplateRows: `repeat(${rowCount}, ${rowHeight}px)`,
      padding: `${padding}px`,
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
    };

    const gridLines: any[] = [];
    for (let c = 1; c <= columns; c++) gridLines.push(html`<div class="line-v" style="grid-column: ${c}; justify-self: start;"></div>`);
    gridLines.push(html`<div class="line-v" style="grid-column: ${columns}; justify-self: end;"></div>`);

    for (let r = 1; r <= rowCount; r++) gridLines.push(html`<div class="line-h" style="grid-row: ${r}; align-self: start;"></div>`);
    gridLines.push(html`<div class="line-h" style="grid-row: ${rowCount}; align-self: end;"></div>`);

    let marqueeStyle = {};
    if (marquee) {
        const left = Math.min(marquee.x1, marquee.x2);
        const top = Math.min(marquee.y1, marquee.y2);
        const width = Math.abs(marquee.x1 - marquee.x2);
        const height = Math.abs(marquee.y1 - marquee.y2);
        marqueeStyle = {
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`,
        };
    }

    return html`
      <div class="grid-overlay" style=${styleMap(gridOverlayStyle)} @mousedown=${this.handleGridMouseDown}>
        ${gridLines}

        ${Object.values(rects).map((rect: any) => {
          const isSelected = (selectedIds ?? []).includes(rect.id);
          const isHovered = hoveredId === rect.id;

          // Hide originals when moving (the ghost is shown instead)
          if (ghost?.type === 'MOVE' && ghost.items?.[rect.id]) return null;

          let borderColor = 'transparent';
          let zIndex = (rect.z || 0) + 1000; // Base z-index for wireframes
          let bgColor = 'transparent';

          if (isSelected) { 
            borderColor = 'rgba(79, 70, 229, 0.8)'; 
            zIndex += 500; // Move selected wireframes above others
          }
          else if (isHovered) { 
            bgColor = 'rgba(79, 70, 229, 0.1)'; 
            borderColor = 'rgba(79, 70, 229, 0.5)'; 
          }

          const rectStyle: any = {
            gridColumnStart: `${rect.x + 1}`,
            gridColumnEnd: `span ${rect.w}`,
            gridRowStart: `${rect.y + 1}`,
            gridRowEnd: `span ${rect.h}`,
            width: '100%',
            height: '100%',
            backgroundColor: bgColor,
            borderColor,
            zIndex,
          };

          return html`
            <div
              class="wireframe ${isSelected ? 'selected' : ''}"
              style=${styleMap(rectStyle)}
              data-id=${rect.id} 
              @mouseenter=${() => this.handleHoverEnter(rect.id)}
              @mouseleave=${this.handleHoverLeave}
            >
              ${isSelected
                ? html`
                    <div class="badge">Block</div>
                    ${(selectedIds?.length ?? 0) === 1
                      ? html`
                          <div class="handle nw" data-direction="nw"></div>
                          <div class="handle ne" data-direction="ne"></div>
                          <div class="handle sw" data-direction="sw"></div>
                          <div class="handle se" data-direction="se"></div>
                        `
                      : null}
                  `
                : null}
            </div>
          `;
        })}

        ${ghost
          ? Object.values(ghost.items).map((item: any) => {
              const rect = item.currentRect;
              const ghostStyle: any = {
                gridColumnStart: `${rect.x + 1}`,
                gridColumnEnd: `span ${rect.w}`,
                gridRowStart: `${rect.y + 1}`,
                gridRowEnd: `span ${rect.h}`,
                width: '100%',
                height: '100%',
                zIndex: 3000,
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                border: '1px dashed #4f46e5',
                position: 'relative',
              };
              return html`<div class="ghost" style=${styleMap(ghostStyle)}></div>`;
            })
          : null}

          ${marquee ? html`<div class="marquee" style=${styleMap(marqueeStyle)}></div>` : null}
      </div>
    `;
  }

  static styles = css`
    :host { position: absolute; inset: 0; pointer-events: none; }
    .wireframe, .handle { pointer-events: auto; }
    .grid-overlay { display: grid; width: 100%; height: 100%; pointer-events: auto; position: relative; }

    .wireframe {
      position: relative;
      border: 1px solid transparent;
      cursor: grab;
      box-sizing: border-box;
      transition: background-color 0.1s, border-color 0.1s;
    }
    .wireframe:active { cursor: grabbing; }
    .wireframe.selected { border: 1px solid #4f46e5; }

    .line-v { grid-row: 1 / -1; width: 1px; background-color: rgba(0, 0, 0, 0.1); pointer-events: none; }
    .line-h { grid-column: 1 / -1; height: 1px; background-color: rgba(0, 0, 0, 0.1); pointer-events: none; }

    .badge {
      position: absolute;
      top: -14px;
      left: 50%;
      transform: translateX(-50%);
      background: rgb(79, 70, 229);
      color: white;
      font-size: 10px;
      padding: 0px 6px;
      border-radius: 4px 4px 0 0;
      font-weight: bold;
      text-transform: uppercase;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0.9;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .handle {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #4f46e5;
      border: 1px solid white;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      z-index: 70;
      pointer-events: auto;
    }
    .handle.nw { top: -5px; left: -5px; cursor: nw-resize; }
    .handle.ne { top: -5px; right: -5px; cursor: ne-resize; }
    .handle.sw { bottom: -5px; left: -5px; cursor: sw-resize; }
    .handle.se { bottom: -5px; right: -5px; cursor: se-resize; }

    .ghost { pointer-events: none; }
    
    .marquee {
        position: absolute;
        border: 1px solid #4f46e5;
        background: rgba(79, 70, 229, 0.1);
        pointer-events: none;
        z-index: 5000;
    }
  `;
}

customElements.define('visual-block-grid', VisualBlockGrid);
