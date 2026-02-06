# XTRNL Visual Block Editor Migration Plan

## 0. Scope, constraints, and objectives

- **External source (read-only):** `xtrnl_external-code-to-migrate/**` (Lit-based visual block editor, preview/projection, AI modal). 
- **Target architecture:** NXT/CoreContext/registry-based framework in this repo, using definition-driven DTOs, ActionCatalog, pure reducers, isolated effects, selectors, and view registries. 
- **This task:** produce a comprehensive migration blueprint **only**; no code changes outside this plan. 

---

## 1. High-level inventory of `xtrnl_external-code-to-migrate/**`

### 1.1 Module map by responsibility

**UI components / views (Lit custom elements)**
- `src/components/visual-block-data.ts`: Data provider and UI state owner (fetch, UI state, AI modal coordination, event handling). 
- `src/components/visual-block-editor.ts`: Main editor shell; derives editor context from data + UI state and renders children. 
- `src/components/visual-block-toolbar.ts`: Toolbar controls for zoom, mode, and AI actions. 
- `src/components/visual-block-grid.ts`: Interactive overlay for selection, drag, resize, Z-order manipulation. 
- `src/components/visual-block-render.ts`: Render-only grid-based content renderer. 
- `src/components/visual-block-preview.ts`: Small 2D preview projection. 
- `src/components/visual-block-projection.ts`: 3D-ish projection with rotation control. 
- `src/components/visual-block-inspector.ts`: Inspector/debug sidebar for selection metadata and stacked z-order. 
- `src/components/visual-block-ai-modal.ts`: AI modal UI for architect/polish/summarize flows. 

**State management / contexts**
- `src/contexts.ts`: Three Lit contexts (`blockDataContext`, `uiStateContext`, `editorContext`). The provider + editor split is used to avoid recomputations and to keep components decoupled. 
- `src/defaults.ts`: `DEFAULT_CONTEXT` and `UiEventDetail` for event payloads. 

**Side-effects / services**
- `src/services/ai.ts`: AI client abstractions (`noopAiClient`, `liveAiClient`, `createGeminiClient`) and `createSystemPrompt` helper for prompt assembly. 

**Routing / layout / packaging**
- `src/index.ts`: Barrel to import/register components. 
- `src/register.ts`: Registers custom elements and exports AI clients for IIFE usage. 
- `demo/index.html`: Demo HTML that wires the editor with IIFE bundle and a sample AI client. 

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
- **User-facing description:** Loads a visual block layout from a URL, keeps editor UI state (zoom, mode, selection, modal), and exposes it to child views. 
- **Technical description:** `visual-block-data` fetches JSON, manages local state, listens to `ui-event` for selection/zoom/mode/AI actions, and updates Lit contexts. 
- **Key source files:** `src/components/visual-block-data.ts`, `src/contexts.ts`, `src/defaults.ts`. 
- **Classification:** **Shared but host-configurable** (data loading + UI state slices should be framework-level; data source wiring/AI client injection is host-specific). 

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
- **User-facing description:** Provides zoom controls, mode toggle (design/render), and AI action buttons. 
- **Technical description:** `visual-block-toolbar` reads UI context and dispatches `ui-event` actions. 
- **Key source files:** `src/components/visual-block-toolbar.ts`, `src/icons.ts`. 
- **Classification:** **Shared but host-configurable** (framework can ship base toolbar; host can override). 

### FBK-ai-modal
- **Feature name:** AI Modal UI
- **User-facing description:** Prompt user for AI instructions and show AI results (architect/polish/summary). 
- **Technical description:** `visual-block-ai-modal` reads `modalState` and dispatches `modal-close`/`modal-submit`. 
- **Key source files:** `src/components/visual-block-ai-modal.ts`. 
- **Classification:** **Shared but host-configurable** (UI component can be framework-level, but AI effects live in host). 

### FBK-ai-service
- **Feature name:** AI Client + Prompting
- **User-facing description:** Lets editor call AI for summaries and adjustments. 
- **Technical description:** `services/ai.ts` provides a client interface and helpers for Gemini or proxy endpoints. 
- **Key source files:** `src/services/ai.ts`. 
- **Classification:** **Playground-only** for live clients; **Framework-worthy** only for the client interface types and system prompt helper. 

### FBK-registration-demo
- **Feature name:** Registration & Demo
- **User-facing description:** Simple page and auto-registration entry for demo usage. 
- **Technical description:** `register.ts` auto-registers custom elements and exports AI clients; demo HTML instantiates the editor with a sample AI client. 
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
- **Framework-level actions (ActionCatalog):**
  - `visualBlock/dataRequested` (payload: `{ src, baseUrl? }`)
  - `visualBlock/dataLoaded` (payload: `{ data }`)
  - `visualBlock/dataFailed` (payload: `{ error }`)
  - `visualBlock/uiZoomChanged` (payload: `{ zoom }`)
  - `visualBlock/uiModeChanged` (payload: `{ mode }`)
  - `visualBlock/selectionChanged` (payload: `{ selectedIds }`)
  - `visualBlock/rotationChanged` (payload: `{ rotationY }`)
  - `visualBlock/modalOpened` (payload: `{ mode, title, contextId? }`)
  - `visualBlock/modalClosed` (payload: `{}`)
  - `visualBlock/modalSubmitted` (payload: `{ mode, input, contextId? }`)
  - `visualBlock/rectsUpdated` (payload: `{ updates: Array<{ id, rect }> }`)
- **Playground-only actions:**
  - `visualBlock/aiSummaryRequested` (payload: `{ data }`)
  - `visualBlock/aiSummaryReceived` (payload: `{ text, raw }`)
  - `visualBlock/aiActionRequested` (payload: `{ mode, input, contextId, data }`)

**3.3 State & Reducers**
- **Framework slices:**
  - `visualBlock.data`: `{ rawData, loading, error }` (hydrated by data actions).
  - `visualBlock.ui`: `{ zoom, mode, selectedIds, rotationY, modalState }` (pure UI state).
  - `visualBlock.rects`: `{ [id]: Rect }` (derived updates applied on rect update action if data is authoritative).
- **Playground slices:**
  - `visualBlock.ai`: `{ status, lastSummary, error }`.
- **Reducer behavior (sketch):**
  - `dataRequested` → set loading; `dataLoaded` → store `rawData`, reset error.
  - `rectsUpdated` → apply immutable patch to `visualBlock.data.rawData.layout.positions` or maintain a parallel rects slice (decision in Phase 0).
  - `modalOpened/Closed/Submitted` → update `modalState`.

**3.4 Effects (IO)**
- **Framework effects:**
  - `visualBlockFetchEffect`: triggered by `dataRequested`, performs fetch, dispatches `dataLoaded`/`dataFailed`.
- **Playground effects:**
  - `visualBlockAiEffect`: triggered by `aiSummaryRequested` or `aiActionRequested`, uses injected AI client to fetch results and dispatches `aiSummaryReceived` or `modalOpened` with result.

**3.5 Selectors**
- `selectVisualBlockData`, `selectVisualBlockUi`, `selectVisualBlockRects`, `selectVisualBlockLoading`.
- `selectModalState`, `selectSelectedIds`.

**3.6 Views & Registries**
- **Views:**
  - Framework: `visual-block-data-provider` (headless data provider) → *could be a view host that wires effects + state to children rather than a Lit component*. 
  - Playground: data-provider wrapper that injects AI client and data source props. 
- **Registries:**
  - Selector registry entries for selectors above. 
  - Effect registry for `visualBlockFetchEffect` (framework), and AI effect (playground). 

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
- `VisualBlockToolbarConfigDTO`: enable/disable AI buttons and design/render toggle. 

**3.2 Actions**
- `visualBlock/uiZoomChanged`, `visualBlock/uiModeChanged`, `visualBlock/aiSummaryRequested`, `visualBlock/modalOpened`. 

**3.3 State & Reducers**
- UI reducer updates zoom/mode/modal state. 

**3.4 Effects (IO)**
- AI effect triggered by summary request. 

**3.5 Selectors**
- `selectZoom`, `selectMode`, `selectIsPrompting`. 

**3.6 Views & Registries**
- Framework view `visual-block-toolbar` (or playground-specific variant). 

---

### FBK-ai-modal

**3.1 Definitions/DTOs**
- `VisualBlockModalStateDTO`: `{ open, mode, title, content, contextId? }`. 

**3.2 Actions**
- `visualBlock/modalOpened`, `visualBlock/modalClosed`, `visualBlock/modalSubmitted`. 

**3.3 State & Reducers**
- UI reducer updates modal state. 

**3.4 Effects (IO)**
- Playground AI effect reacts to modal submission and dispatches results. 

**3.5 Selectors**
- `selectModalState`, `selectIsModalOpen`. 

**3.6 Views & Registries**
- Framework view `visual-block-ai-modal` (optional). 

---

### FBK-ai-service

**3.1 Definitions/DTOs**
- `AiClientDefinitionDTO`: definition of AI client injection options (type, endpoint). 
- `AiPromptConfigDTO`: template/config for system prompt. 

**3.2 Actions**
- `visualBlock/aiSummaryRequested`, `visualBlock/aiSummaryReceived`, `visualBlock/aiActionRequested`. 

**3.3 State & Reducers**
- Playground AI slice stores results and errors. 

**3.4 Effects (IO)**
- AI effect calls injected client (proxy or Gemini). 

**3.5 Selectors**
- `selectAiSummary`, `selectAiStatus`. 

**3.6 Views & Registries**
- Playground registers AI effect and host-specific AI client adapter. 

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
  - `createSystemPrompt` from `src/services/ai.ts` could be generalized for AI integration and kept in playground or shared utils. 
- **Playground-specific utilities:**
  - Demo-specific AI client wiring, Gemini key usage (keep in playground). 
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
- **Risk:** Low; should be additive and behind a feature flag. 
- **Branching strategy:** Feature flag `visualBlockEnabled` in playground registry. 

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
- **Branching strategy:** Feature flag `visualBlockEditingEnabled` to allow render-only mode. 

### Phase 4: Toolbar + modal
- **Target features:** FBK-toolbar, FBK-ai-modal. 
- **Framework changes:**
  - Add toolbar view (or allow host override). 
  - Add modal view with CoreContext selectors/actions. 
- **Playground changes:**
  - Provide host AI effect that consumes modal submit actions and produces results. 
- **Risk:** Medium (AI integration + UI flow). 
- **Dependencies:** Phase 1 (UI state). 

### Phase 5: Projection + inspector (optional)
- **Target features:** FBK-projection, FBK-inspector. 
- **Framework changes:**
  - Likely none (keep in playground). 
- **Playground changes:**
  - Add optional views in registry; keep behind feature flags. 
- **Risk:** Low (optional). 

### Final Phase: Cleanup
- **Goal:** remove legacy external references from production build. 
- **Tasks:**
  - Remove temporary adapters and feature flags when migration completes. 
  - Ensure no references remain to `xtrnl_external-code-to-migrate` outside migration docs. 

---

## 6. Risk analysis & open questions

### Key risks
1. **Data model ambiguity**: External code infers layout from `layout_lg.positions` with fallbacks for `data[pos._positionID]`. This needs a clear schema for DTOs. 
   - *Mitigation:* Define formal DTOs in Phase 0 and add validation or adapter layer in playground. 
2. **State synchronization**: External code mutates data and derived rects in the provider. Splitting into reducers + selectors risks drift between `rawData` and `rects`. 
   - *Mitigation:* Decide a single source of truth (either raw data or a normalized rects slice) early. 
3. **Complex pointer interactions**: Drag/resize/marquee/z-order logic is large and event-driven. 
   - *Mitigation:* Move interaction logic into view-only code and keep reducers minimal; add focused tests around reducer outputs. 
4. **AI integration security**: Demo uses client-side Gemini API key; unsafe in production. 
   - *Mitigation:* Keep AI clients playground-only and require host-provided proxy client. 
5. **Unsafe HTML rendering**: Renderer uses `unsafeHTML` for text content. 
   - *Mitigation:* Document sanitization requirements and potentially add sanitizer in playground host. 

### Open questions / assumptions
- **Schema ownership:** Should the canonical layout schema live in framework DTOs or be host-provided? 
- **Normalization strategy:** Do we normalize `layout_lg.positions` into a rect map in state, or keep raw data and derive in selectors? 
- **Selection semantics:** Should selection live in framework UI state or be host-specific? 
- **AI workflow:** Are AI actions expected to mutate layout automatically or just return suggestions? 
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

