# XTRNL Visual Block Editor Migration Plan

## Migration status (completed)

- **Runtime source of truth:** `packages/playground/src/visual-block/**` with registration in `packages/playground/src/visual-block/register-visual-block.ts`.
- **Integration surface:** update `visual-block-definition-pack.ts` and `register-visual-block.ts` to extend reducers/selectors/views within the playground scope.
- **Legacy reference only:** `xtrnl_external-code-to-migrate/**` remains read-only and is not imported at runtime.
- **AI removed:** No AI services, prompts, or UI controls are part of the migrated visual block runtime.
- **No migration toggles:** Legacy adapters and feature flags have been removed; the migrated visual block implementation is the sole runtime path.

## 0. Scope, constraints, and objectives

- **External source (read-only):** `xtrnl_external-code-to-migrate/**` (Lit-based visual block editor, preview/projection, AI modal). 
- **Target architecture:** NXT/CoreContext/registry-based framework in this repo, using definition-driven DTOs, ActionCatalog, pure reducers, isolated effects, selectors, and view registries. 
- **Document status:** this plan is historical reference; the visual block migration is complete and the runtime path now lives in `packages/playground/src/visual-block/**` only. 

---

## 1. High-level inventory of `xtrnl_external-code-to-migrate/**`

### 1.1 Module map by responsibility

**UI components / views (Lit custom elements)**
- `src/components/visual-block-data.ts`: Data provider and UI state owner (fetch, UI state, event handling; AI modal coordination is legacy-only). 
- `src/components/visual-block-editor.ts`: Main editor shell; derives editor context from data + UI state and renders children. 
- `src/components/visual-block-toolbar.ts`: Toolbar controls for zoom and mode (AI actions are legacy-only). 
- `src/components/visual-block-grid.ts`: Interactive overlay for selection, drag, resize, Z-order manipulation. 
- `src/components/visual-block-render.ts`: Render-only grid-based content renderer. 
- `src/components/visual-block-preview.ts`: Small 2D preview projection. 
- `src/components/visual-block-projection.ts`: 3D-ish projection with rotation control. 
- `src/components/visual-block-inspector.ts`: Inspector/debug sidebar for selection metadata and stacked z-order. 
- `src/components/visual-block-ai-modal.ts`: AI modal UI for architect/polish/summarize flows (legacy-only). 

**State management / contexts**
- `src/contexts.ts`: Three Lit contexts (`blockDataContext`, `uiStateContext`, `editorContext`). The provider + editor split is used to avoid recomputations and to keep components decoupled. 
- `src/defaults.ts`: `DEFAULT_CONTEXT` and `UiEventDetail` for event payloads. 

**Side-effects / services (legacy-only)**
- `src/services/ai.ts`: AI client abstractions (`noopAiClient`, `liveAiClient`, `createGeminiClient`) and `createSystemPrompt` helper for prompt assembly. **Not migrated.** 

**Routing / layout / packaging**
- `src/index.ts`: Barrel to import/register components. 
- `src/register.ts`: Registers custom elements and exports AI clients for IIFE usage (legacy-only). 
- `demo/index.html`: Demo HTML that wires the editor with IIFE bundle and a sample AI client (legacy-only). 

**Utilities**
- `src/utils/grid.ts`: `clampGrid` helper for constraining size/position in grid bounds. 
- `src/icons.ts`: Inline SVG icon set. 

### 1.2 Architectural patterns in external codebase

- **Lit + @lit/context**: All UI components are Lit elements. Global state is passed via contexts (`blockDataContext`, `uiStateContext`, `editorContext`) with providers/consumers. 
- **Local UI state in provider element**: `visual-block-data` owns the UI state (zoom, mode, selection, rotation, modal state) and mutates it in response to DOM events. 
- **Derived editor context**: `visual-block-editor` consumes data + UI state, computes derived metrics (rects, grid config, container size) and re-provides via `editorContext`. 
- **Event-based interactions**: Components dispatch `ui-event` CustomEvents with string `type` payloads; the provider handles them via switch. 
- **Direct IO in components**: `visual-block-data` calls `fetch` for block data and `aiClient` calls for AI. No effects layer. 
- **Render pipeline**: `visual-block-render`, `visual-block-preview`, and `visual-block-projection` read editor context and generate HTML/CSS grid output. 
- **Implicit data model**: Block layout is expected in `layout_lg.positions`, with content referenced by `_contentID` keys in the block data object. 

---

## 2. Feature breakdown and classification (Feature Catalog)

> **Legend for classification**
> - **Framework-worthy**: reusable primitives to live under `packages/framework/src/nxt/**`. 
> - **Playground-only**: host-specific demo wiring under `playground/src/**`. 
> - **Shared but host-configurable**: framework core + host-provided registry loaders/config. 

### FBK-data-provider
- **Feature name:** Data Provider + UI State Owner
- **User-facing description:** Loads a visual block layout from a URL, keeps editor UI state (zoom, mode, selection), and exposes it to child views. 
- **Technical description:** `visual-block-data` fetches JSON, manages local state, listens to `ui-event` for selection/zoom/mode/AI actions, and updates Lit contexts. 
- **Key source files:** `src/components/visual-block-data.ts`, `src/contexts.ts`, `src/defaults.ts`. 
- **Classification:** **Shared but host-configurable** (data loading + UI state slices should be framework-level; data source wiring is host-specific; AI is intentionally not part of the migrated runtime). 

### FBK-editor-context
- **Feature name:** Editor Context Derivation
- **User-facing description:** Converts raw block data + UI state into computed layout rectangles, grid metrics, and container sizes used by renderers. 
- **Technical description:** `visual-block-editor` consumes contexts, builds rect lookup, grid config, container size, then provides `editorContext`. 
- **Key source files:** `src/components/visual-block-editor.ts`, `src/defaults.ts`. 
- **Classification:** **Framework-worthy** (core editor derivations are reusable). 

### FBK-grid-editing
- **Feature name:** Grid Editing Overlay
- **User-facing description:** Enables selection, drag-move, resize, marquee selection, and z-index cycling in design mode. 
- **Technical description:** `visual-block-grid` handles mouse/keyboard interactions, produces rect patches, and emits `rect-update` and `selection-change` events. 
- **Key source files:** `src/components/visual-block-grid.ts`, `src/utils/grid.ts`. 
- **Classification:** **Framework-worthy** (core editing interactions are reusable). 

### FBK-renderer
- **Feature name:** Render-only Grid Renderer
- **User-facing description:** Renders the visual blocks in a CSS grid with styles from layout and content metadata. 
- **Technical description:** `visual-block-render` reads editor context, merges block/container/layout styles, and renders content using unsafe HTML or images. 
- **Key source files:** `src/components/visual-block-render.ts`. 
- **Classification:** **Framework-worthy** (core renderer). 

### FBK-preview
- **Feature name:** 2D Preview Projection
- **User-facing description:** Displays a miniature face-on preview of the layout. 
- **Technical description:** `visual-block-preview` renders a scaled CSS grid with block content. 
- **Key source files:** `src/components/visual-block-preview.ts`. 
- **Classification:** **Shared but host-configurable** (useful in framework but may be optional). 

### FBK-projection
- **Feature name:** 3D-ish Projection
- **User-facing description:** Displays a 3D-like rotated projection with drag-to-rotate and reset. 
- **Technical description:** `visual-block-projection` maps rects to absolute 3D transforms, dispatches rotation actions. 
- **Key source files:** `src/components/visual-block-projection.ts`. 
- **Classification:** **Playground-only** (visual flourish, may be optional for framework). 

### FBK-inspector
- **Feature name:** Inspector Sidebar
- **User-facing description:** Shows selected block metadata, z-index stack, and styling diagnostics. 
- **Technical description:** `visual-block-inspector` reads block data, UI selection, and editor rects to render debug info. 
- **Key source files:** `src/components/visual-block-inspector.ts`. 
- **Classification:** **Playground-only** (debug tooling). 

### FBK-toolbar
- **Feature name:** Toolbar Controls
- **User-facing description:** Provides zoom controls and mode toggle (design/render). 
- **Technical description:** `visual-block-toolbar` reads UI context and dispatches `ui-event` actions. AI controls are legacy-only and not migrated. 
- **Key source files:** `src/components/visual-block-toolbar.ts`, `src/icons.ts`. 
- **Classification:** **Shared but host-configurable** (framework can ship base toolbar; host can override). 

### FBK-ai-modal
- **Feature name:** AI Modal UI
- **User-facing description:** Legacy AI modal from the external reference. 
- **Technical description:** `visual-block-ai-modal` reads `modalState` and dispatches `modal-close`/`modal-submit`. **Not migrated.** 
- **Key source files:** `src/components/visual-block-ai-modal.ts`. 
- **Classification:** **Removed from migrated runtime** (intentionally excluded). 

### FBK-ai-service
- **Feature name:** AI Client + Prompting
- **User-facing description:** Legacy AI client and prompting utilities. 
- **Technical description:** `services/ai.ts` provides a client interface and helpers for Gemini or proxy endpoints. **Not migrated.** 
- **Key source files:** `src/services/ai.ts`. 
- **Classification:** **Removed from migrated runtime** (legacy reference only). 

### FBK-registration-demo
- **Feature name:** Registration & Demo
- **User-facing description:** Simple page and auto-registration entry for demo usage. 
- **Technical description:** `register.ts` auto-registers custom elements; demo HTML instantiates the editor (legacy-only). 
- **Key source files:** `src/register.ts`, `demo/index.html`, `src/index.ts`. 
- **Classification:** **Playground-only**. 

---

## 3. Mapping to NXT/CoreContext architecture

> **Template per feature:** Definitions/DTOs → Actions → State/Reducers → Effects → Selectors → Views/Registries.

### FBK-data-provider

**3.1 Definitions/DTOs**
- **New DTOs (framework-level):**
  - `VisualBlockLayoutDefinitionDTO`: layout metadata (`layoutKey`, `columns`, `rowHeight`, `maxWidth`, `positions`).
  - `VisualBlockContentDefinitionDTO`: content item (`contentId`, `type`, `styler`, `ui`).
  - `VisualBlockDataDefinitionDTO`: root data (layout + content map + container styler).
  - `VisualBlockUiStateDTO`: editor UI state (zoom, mode, selection, rotation, modal state).
  - `VisualBlockSourceDTO`: fetch configuration (`src`, `baseUrl`, optional auth/config).
- **Reuse/extend:** If a generic `DataSourceDefinitionDTO` exists, extend it for `VisualBlockSourceDTO`.

**3.2 Actions**
- **Playground data-loading actions:**
  - `VisualBlockDataRequested` (payload: `{ sourceId, params? }`)
  - `VisualBlockDataLoaded` (payload: `{ sourceId, definition }`)
  - `VisualBlockDataLoadFailed` (payload: `{ sourceId, error }`)
- **Visual block ActionCatalog entries (migrated runtime):**
  - `visual-block/dataSet`, `visual-block/dataPatch`
  - `visual-block/uiSet`, `visual-block/uiPatch`
  - `visual-block/zoomChanged`, `visual-block/modeChanged`, `visual-block/rotationChanged`
- **AI actions:** none (intentionally excluded from the migrated runtime).

**3.3 State & Reducers**
- **Migrated slices:**
  - `visualBlockData`: `{ layouts, rects, contents, activeLayoutId }`.
  - `visualBlockUi`: `{ zoom, mode, selectedIds, blockId, rotationY, modalState }`.
- **Reducer behavior (current):**
  - Data reducer supports replace/patch updates via `dataSet`/`dataPatch`.
  - UI reducer supports replace/patch updates via `uiSet`/`uiPatch` plus zoom/mode/rotation actions.

**3.4 Effects (IO)**
- **Playground effects:**
  - `createVisualBlockDataRequestedEffect`: triggered by `VisualBlockDataRequested`, performs fetch + mapping, dispatches `VisualBlockDataLoaded`/`VisualBlockDataLoadFailed`.
- **AI effects:** none (intentionally excluded from the migrated runtime).

**3.5 Selectors**
- `visualBlockDataSelector`, `visualBlockUiSelector`, `visualBlockRenderModelSelector`.
- `visualBlockProjectionModelSelector`, `visualBlockInspectorModelSelector`.

**3.6 Views & Registries**
- **Views:**
  - Playground: visual block render, projection, preview, inspector, grid overlay, and toolbar views registered under `packages/playground/src/visual-block/**`. 
- **Registries:**
  - Selector registry entries for selectors above. 
  - Reducer registry entries for visual block data/ui reducers and the data-loading effect entry. 

---

### FBK-editor-context

**3.1 Definitions/DTOs**
- `VisualBlockEditorConfigDTO`: editor-specific configuration (default padding, layout key, min grid sizes). 
- `VisualBlockGridConfigDTO`: derived grid config (`columns`, `rowHeight`, `padding`, `stepX`, `stepY`).

**3.2 Actions**
- `visualBlock/editorDerivedUpdated` (payload: `{ rects, gridConfig, containerSize }`) if storing derived data in state (optional). 

**3.3 State & Reducers**
- **Framework slices:**
  - `visualBlock.editor`: `{ rects, gridConfig, containerSize }` if derivations are stored. 
  - Alternative: keep derived data as selectors only (preferred) to avoid redundant state. 

**3.4 Effects (IO)**
- None (pure derivations). 

**3.5 Selectors**
- `selectGridConfig`, `selectContainerSize`, `selectRectLookup` derived from raw data + UI state. 

**3.6 Views & Registries**
- Framework view `visual-block-editor` becomes a pure presenter that reads selectors and renders children. 
- Registry: selectors for rect lookup, grid config, container size. 

---

### FBK-grid-editing

**3.1 Definitions/DTOs**
- `RectDTO`: `{ id, contentId, x, y, w, h, z }`. 
- `SelectionDTO`: `{ selectedIds: string[] }`. 

**3.2 Actions**
- `visualBlock/selectionChanged` (framework). 
- `visualBlock/rectsUpdated` (framework). 
- `visualBlock/zOrderAdjusted` (framework) for wheel-based z-change. 

**3.3 State & Reducers**
- Reducers update `visualBlock.ui.selectedIds` and `visualBlock.data` or `visualBlock.rects` depending on chosen data model. 

**3.4 Effects (IO)**
- None; all interactions are local. 

**3.5 Selectors**
- `selectHoveredId` (if stored), `selectSelection`, `selectGridOverlayRects`. 

**3.6 Views & Registries**
- Framework view `visual-block-grid` that consumes selectors and dispatches selection/rect update actions. 
- Register in view registry for editor overlay. 

---

### FBK-renderer

**3.1 Definitions/DTOs**
- `VisualBlockStylerDTO`: style objects for block/container/layout/element. 

**3.2 Actions**
- None (render-only). 

**3.3 State & Reducers**
- None (derived from data). 

**3.4 Effects (IO)**
- None. 

**3.5 Selectors**
- `selectRenderableBlocks` (rects + content + computed row counts). 

**3.6 Views & Registries**
- Framework view `visual-block-render` renders grid with styling. 
- Registered in view registry; used by editor and read-only surfaces. 

---

### FBK-preview

**3.1 Definitions/DTOs**
- No new DTOs (reuse layout + rect DTOs). 

**3.2 Actions**
- None. 

**3.3 State & Reducers**
- None. 

**3.4 Effects (IO)**
- None. 

**3.5 Selectors**
- `selectPreviewGrid` (derived row count + scaled container size). 

**3.6 Views & Registries**
- Framework or optional view `visual-block-preview` registered for optional overlays. 

---

### FBK-projection

**3.1 Definitions/DTOs**
- `VisualBlockProjectionConfigDTO`: rotation constraints and scale. 

**3.2 Actions**
- `visualBlock/rotationChanged` (framework). 

**3.3 State & Reducers**
- Update `visualBlock.ui.rotationY`. 

**3.4 Effects (IO)**
- None. 

**3.5 Selectors**
- `selectProjectionBlocks` (rects + rotation). 

**3.6 Views & Registries**
- Playground view `visual-block-projection` with optional registration. 

---

### FBK-inspector

**3.1 Definitions/DTOs**
- No new DTOs; reuse selection + rect DTOs. 

**3.2 Actions**
- None. 

**3.3 State & Reducers**
- None (pure derived display). 

**3.4 Effects (IO)**
- None. 

**3.5 Selectors**
- `selectInspectorSelection`, `selectOverlapStack`, `selectSelectedBlockStyler`. 

**3.6 Views & Registries**
- Playground-only inspector view registered in playground registry. 

---

### FBK-toolbar

**3.1 Definitions/DTOs**
- `VisualBlockToolbarConfigDTO`: design/render toggle and zoom controls only (AI options removed). 

**3.2 Actions**
- `visual-block/zoomChanged`, `visual-block/modeChanged`. 

**3.3 State & Reducers**
- UI reducer updates zoom/mode state. 

**3.4 Effects (IO)**
- None. 

**3.5 Selectors**
- `visualBlockUiSelector` (zoom/mode selection). 

**3.6 Views & Registries**
- Playground view `visual-block-toolbar` registered via visual block definitions. 

---

### FBK-ai-modal

**3.1 Definitions/DTOs**
- `VisualBlockModalStateDTO`: legacy-only reference (modal UI not migrated). 

**3.2 Actions**
- None (AI modal is intentionally excluded). 

**3.3 State & Reducers**
- None (AI modal is intentionally excluded). 

**3.4 Effects (IO)**
- None (AI modal is intentionally excluded). 

**3.5 Selectors**
- None (AI modal is intentionally excluded). 

**3.6 Views & Registries**
- None (AI modal is intentionally excluded). 

---

### FBK-ai-service

**3.1 Definitions/DTOs**
- None (legacy-only; AI services not migrated). 

**3.2 Actions**
- None (legacy-only; AI services not migrated). 

**3.3 State & Reducers**
- None (legacy-only; AI services not migrated). 

**3.4 Effects (IO)**
- None (legacy-only; AI services not migrated). 

**3.5 Selectors**
- None (legacy-only; AI services not migrated). 

**3.6 Views & Registries**
- None (legacy-only; AI services not migrated). 

---

### FBK-registration-demo

**3.1 Definitions/DTOs**
- None. 

**3.2 Actions**
- None. 

**3.3 State & Reducers**
- None. 

**3.4 Effects (IO)**
- None. 

**3.5 Selectors**
- None. 

**3.6 Views & Registries**
- Playground demo uses view registry to render editor stack. 
- **Playground/demo wiring paths (current runtime):**
  - View registries, demo loaders, and view wrappers live under `packages/demo/src/visual-block/*`. 
  - Core visual-block registry wiring lives under `packages/playground/src/visual-block/register-visual-block.ts`. 
- **Steps to expose migrated views/effects in the demo:**
  1. Ensure reducers/selectors/effects are registered in `packages/playground/src/visual-block/register-visual-block.ts` so the CoreContext can resolve migrated visual-block state. 
  2. Register migrated views (render, grid overlay, toolbar, preview, projection, inspector) in the demo view registry under `packages/demo/src/visual-block/*`. 
  3. Export the demo view registry entries from the demo package so the demo host can render the visual-block stack. 
  4. Verify the demo host imports the visual-block demo registry wiring and mounts the visual-block view entrypoint. 

---

## 4. Cross-cutting concerns & refactors

### 4.1 Global state patterns to replace

- **Lit contexts → CoreContext**: Replace `blockDataContext`, `uiStateContext`, and `editorContext` with a single CoreContext plus selectors. Example: `src/contexts.ts` defines multiple contexts; these become selectors and state slices under CoreContext. 
- **Component-owned UI state → reducers**: `visual-block-data` stores UI state and mutates it directly; migrate to reducers for `visualBlock.ui` (zoom/mode/selection/rotation/modal). 
- **Event switch → ActionCatalog**: `ui-event` types are free-form strings. Replace with `ActionCatalog` entries and typed payloads. 

### 4.2 Duplicated or overlapping functionality

- **Layout/selection handling**: There may be existing layout reducers/selectors (e.g., `LayoutDragStart/End` in ActionCatalog). Evaluate reuse vs. dedicated visual-block actions to avoid conflicting semantics. 
- **Panel/overlay management**: Existing panel/overlay system (`PanelsAssignView`, `LayoutSetOverlayView`) may already provide host UI. Use these instead of hard-coded inspector placement. 
- **Logging/error handling**: Existing logging actions (`LogsAppend`) could replace ad-hoc `console.error` and `alert`. 

### 4.3 Utilities & helper functions

- **Framework-worthy utilities:**
  - `clampGrid` from `src/utils/grid.ts` → framework-level math/util module. 
  - `createSystemPrompt` from `src/services/ai.ts` is legacy-only and not part of the migrated runtime. 
- **Playground-specific utilities:**
  - Demo-specific AI client wiring, Gemini key usage (legacy-only; not migrated). 
- **Mixed concerns to split:**
  - `visual-block-data` currently mixes IO, state, and view. Split into: effects for IO, reducers for state, and view for dispatching actions. 

---

## 5. Phased migration roadmap

### Phase 0: Preparation (foundation)
- **Goal:** establish DTOs, actions, and registries for visual blocks without changing UI behavior. 
- **Framework tasks:**
  - Add DTOs under `packages/framework/src/nxt/definitions/dto/visual-block/**`. 
  - Add ActionCatalog entries for core visual block actions. 
  - Add selectors for base state slices and derived layout (rects/grid config). 
  - Add reducers for `visualBlock.data` and `visualBlock.ui`. 
- **Playground tasks:**
  - Add demo wiring with minimal registry entries. 
- **Risk:** Low; completed with the migrated implementation as the only runtime path. 
- **Branching strategy:** Feature flag `visualBlockEnabled` was removed after migration completion. 

### Phase 1: Data provider + core state
- **Target features:** FBK-data-provider, FBK-editor-context (partial). 
- **Framework changes:**
  - Implement data fetching effect and data reducer. 
  - Implement selectors for derived rects/grid config (no views yet or use placeholder view). 
- **Playground changes:**
  - Provide host-specific data source configuration (base URL). 
  - Minimal view shell for data provider. 
- **Risk:** Medium (state shape decisions). 
- **Dependencies:** Phase 0. 

### Phase 2: Editor render surfaces
- **Target features:** FBK-renderer, FBK-preview. 
- **Framework changes:**
  - Add render view component using selectors. 
  - Add preview view component (optional). 
- **Playground changes:**
  - Wire views into registry and demo host. 
- **Risk:** Low (view-only). 
- **Dependencies:** Phase 1 (requires data state + selectors). 

### Phase 3: Grid editing interactions
- **Target features:** FBK-grid-editing. 
- **Framework changes:**
  - Add grid overlay view and reducers for selection + rect updates. 
  - Ensure reducers remain pure, decouple mouse logic from state. 
- **Playground changes:**
  - Provide configuration for edit mode toggles. 
- **Risk:** High (complex interactions and state synchronization). 
- **Dependencies:** Phases 1–2. 
- **Branching strategy:** Feature flag `visualBlockEditingEnabled` was removed after migration completion. 

### Phase 4: Toolbar + modal
- **Target features:** FBK-toolbar, FBK-ai-modal. 
- **Framework changes:**
  - Add toolbar view (or allow host override). 
  - AI modal was intentionally excluded from the migrated runtime (no CoreContext selectors/actions added for AI). 
- **Playground changes:**
  - None for AI; migrated toolbar focuses on zoom and mode only. 
- **Risk:** Low (AI integration removed). 
- **Dependencies:** Phase 1 (UI state). 

### Phase 5: Projection + inspector (optional)
- **Target features:** FBK-projection, FBK-inspector. 
- **Framework changes:**
  - Likely none (keep in playground). 
- **Playground changes:**
  - Optional views are wired directly without feature flags. 
- **Risk:** Low (optional). 

### Final Phase: Cleanup
- **Goal:** remove legacy external references from production build. 
- **Tasks:**
  - Removed temporary adapters and feature flags after migration completion. 
  - Ensure no references remain to `xtrnl_external-code-to-migrate` outside migration docs. 
  - **Completed:** runtime path now depends solely on `packages/playground/src/visual-block/**`. 

---

## 6. Risk analysis & open questions

### Key risks
1. **Data model ambiguity**: External code infers layout from `layout_lg.positions` with fallbacks for `data[pos._positionID]`. This needs a clear schema for DTOs. 
   - *Mitigation:* Define formal DTOs in Phase 0 and add validation or adapter layer in playground. 
2. **State synchronization**: External code mutates data and derived rects in the provider. Splitting into reducers + selectors risks drift between `rawData` and `rects`. 
   - *Mitigation:* Decide a single source of truth (either raw data or a normalized rects slice) early. 
3. **Complex pointer interactions**: Drag/resize/marquee/z-order logic is large and event-driven. 
   - *Mitigation:* Move interaction logic into view-only code and keep reducers minimal; add focused tests around reducer outputs. 
4. **AI integration security**: Legacy demo used client-side Gemini API key; unsafe in production. 
   - *Mitigation:* AI features are intentionally excluded from the migrated runtime. 
5. **Unsafe HTML rendering**: Renderer uses `unsafeHTML` for text content. 
   - *Mitigation:* Document sanitization requirements and potentially add sanitizer in playground host. 

### Open questions / assumptions
- **Schema ownership:** Should the canonical layout schema live in framework DTOs or be host-provided? 
- **Normalization strategy:** Do we normalize `layout_lg.positions` into a rect map in state, or keep raw data and derive in selectors? 
- **Selection semantics:** Should selection live in framework UI state or be host-specific? 
- **AI workflow:** Intentionally out of scope for the migrated visual block runtime. 
- **Mode toggle:** Should “design/render” mode be a framework concept or a host-only mode? 

---

## Appendix: Suggested file destinations (future implementation)

> **Note:** This is a target mapping for future tasks only.

- **Framework DTOs:** `packages/framework/src/nxt/definitions/dto/visual-block/*` 
- **Framework reducers:** `packages/framework/src/nxt/reducers/visual-block/*` 
- **Framework selectors:** `packages/framework/src/nxt/selectors/visual-block/*` 
- **Framework effects:** `packages/framework/src/nxt/effects/visual-block/*` 
- **Framework views:** `packages/framework/src/nxt/views/components/visual-block/*` 
- **Framework registries:** `packages/framework/src/nxt/runtime/registries/*` 
- **Playground views/effects:** `playground/src/nxt/visual-block/*` 
