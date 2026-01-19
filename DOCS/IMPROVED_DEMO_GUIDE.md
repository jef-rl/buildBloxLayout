# BuildBlox Framework - Improved Demo Guide

## Overview

This improved demo showcases the **correct architecture patterns** for the BuildBlox Layout Framework. It demonstrates:

1. ✅ **Proper Context Usage**: Read-only consumption via `ContextConsumer`
2. ✅ **Handler Dispatch Pattern**: Event-driven state updates via `dispatchUiEvent`
3. ✅ **View Registry**: Centralized view definitions and lazy loading
4. ✅ **Panel Management**: Structural containers with view assignments
5. ✅ **State Flow**: Unidirectional data flow from context to views

---

## Architecture Principles

### 1. Context Pattern (READ ONLY)

**✅ CORRECT:**
```typescript
// In your view component
private uiState: UiStateContextValue['state'] | null = null;
private uiDispatch: UiStateContextValue['dispatch'] | null = null;

private uiStateConsumer = new ContextConsumer(this, {
  context: uiStateContext,
  subscribe: true,
  callback: (value: UiStateContextValue | undefined) => {
    // Store reference but NEVER mutate
    this.uiState = value?.state ?? null;
    this.uiDispatch = value?.dispatch ?? null;
    this.requestUpdate();
  },
});

// Use state for rendering
render() {
  const isLoggedIn = this.uiState?.auth?.isLoggedIn ?? false;
  return html`<div>Status: ${isLoggedIn ? 'Logged In' : 'Guest'}</div>`;
}
```

**❌ INCORRECT:**
```typescript
// NEVER do this - direct state mutation
this.uiState.auth.isLoggedIn = true; // ❌ WRONG
this.uiState.layout.expansion.left = true; // ❌ WRONG
```

---

### 2. State Updates (Handler Dispatch)

**✅ CORRECT:**
```typescript
import { dispatchUiEvent } from '@project/framework';

// Dispatch an action to update state
private toggleLeftPanel() {
  const currentState = this.uiState?.layout?.expansion?.left ?? false;
  
  // Event flows through handler registry → state update → context refresh
  dispatchUiEvent(this, 'layout/setExpansion', {
    side: 'left',
    expanded: !currentState
  });
}

// The framework handles:
// 1. Action routing through handler registry
// 2. State validation and update
// 3. Context provider refresh
// 4. View re-renders
```

**❌ INCORRECT:**
```typescript
// NEVER mutate context directly
private toggleLeftPanel() {
  this.uiState.layout.expansion.left = !this.uiState.layout.expansion.left; // ❌ WRONG
  this.requestUpdate(); // ❌ Won't propagate to other views
}
```

---

### 3. View Communication

**✅ CORRECT: Via Shared Context**
```typescript
// View A: Updates selection
private selectItem(itemId: string) {
  dispatchUiEvent(this, 'context/patch', {
    namespace: 'app',
    changes: { selectedItemId: itemId }
  });
}

// View B: Reacts to selection change
render() {
  const appContext = this.uiState?.app as { selectedItemId?: string };
  const selectedId = appContext?.selectedItemId;
  
  return html`
    <div>Selected: ${selectedId ?? 'None'}</div>
  `;
}
```

**❌ INCORRECT: Direct View-to-View Communication**
```typescript
// NEVER reference other views directly
const otherView = document.querySelector('other-view'); // ❌ WRONG
otherView.updateSelection(itemId); // ❌ Tight coupling
```

---

### 4. Panel-View Relationship

**✅ CORRECT: Views Attach to Panels**
```typescript
// Panels are structural containers
const panel: Panel = {
  id: 'panel-main-1',
  name: 'Main Panel 1',
  region: 'main',
  viewId: 'canvas-editor',  // View ID reference
  view: viewInstance         // View instance (created by registry)
};

// Assign view to panel via action
dispatchUiEvent(this, 'panels/assignView', {
  panelId: 'panel-main-1',
  viewId: 'canvas-editor'
});
```

**❌ INCORRECT: Views as Panels**
```typescript
// NEVER treat views as structural elements
const view = {
  position: 'left', // ❌ Views don't have positions
  size: '25%'       // ❌ Panels control sizing
}; // ❌ WRONG ARCHITECTURE
```

---

## Handler Actions Reference

### Layout Actions

```typescript
// Expand/collapse panels
dispatchUiEvent(target, 'layout/setExpansion', {
  side: 'left' | 'right' | 'bottom',
  expanded: boolean
});

// Set viewport mode (controls visible panel count)
dispatchUiEvent(target, 'layout/setViewportWidthMode', {
  mode: '1x' | '2x' | '3x' | '4x' | '5x' | 'auto'
});

// Open/close overlay
dispatchUiEvent(target, 'layout/setOverlayView', {
  viewId: string | null
});

// Set main area panel count
dispatchUiEvent(target, 'layout/setMainAreaCount', {
  count: 1 | 2 | 3 | 4 | 5
});
```

### Panel Actions

```typescript
// Assign view to panel
dispatchUiEvent(target, 'panels/assignView', {
  viewId: string,
  panelId?: string  // Optional: defaults to selected panel
});

// Set main view order (for toolbar)
dispatchUiEvent(target, 'panels/setMainViewOrder', {
  viewOrder: string[]  // Array of view IDs
});

// Select panel (for subsequent operations)
dispatchUiEvent(target, 'panels/selectPanel', {
  panelId: string
});
```

### Context Actions

```typescript
// Update nested property
dispatchUiEvent(target, 'context/update', {
  path: 'app.selectedId' | ['app', 'selectedId'],
  value: any
});

// Patch entire namespace
dispatchUiEvent(target, 'context/patch', {
  namespace: 'app' | 'feature' | 'data',
  changes: Record<string, any>
});
```

### Auth Actions

```typescript
// Set user (login/logout)
dispatchUiEvent(target, 'auth/setUser', {
  user: { uid: string, email?: string } | null
});
```

### Session Actions

```typescript
// Reset session (clear state)
dispatchUiEvent(target, 'session/reset');
```

---

## View Lifecycle

### 1. View Registration

```typescript
// In main.ts or bootstrap file
import { ViewRegistry } from '@project/framework';

ViewRegistry.register({
  id: 'canvas-editor',           // Unique identifier
  name: 'Canvas Editor',         // Display name
  title: 'Canvas Editor',        // Title (for UI)
  tag: 'canvas-editor',          // Custom element tag name
  icon: 'edit',                  // Icon identifier
  component: () => import('./components/canvas-editor')  // Lazy loader
});
```

### 2. View Creation

```typescript
// Framework handles view creation automatically
// When a view is assigned to a panel:
// 1. ViewRegistry.createView(viewId) is called
// 2. Component is lazy-loaded if needed
// 3. Custom element is instantiated
// 4. Element is attached to panel's view container
// 5. View receives data prop from panel
```

### 3. View Data Flow

```typescript
// Panel definition with view data
const panel: Panel = {
  id: 'panel-1',
  region: 'main',
  viewId: 'canvas-editor',
  view: {
    id: 'canvas-editor-instance',
    name: 'Canvas Editor',
    component: 'canvas-editor',
    data: {                    // ← Data passed to view
      label: 'Canvas Editor',
      color: '#1e40af',
      initialDocument: {...}
    }
  }
};

// View receives data via property
@customElement('canvas-editor')
export class CanvasEditor extends LitElement {
  @property({ type: Object }) data: any = null;
  
  // Data flows: Panel → View via property binding
  // View can read data but should not mutate panel state directly
}
```

---

## State Shape Reference

```typescript
interface UIState {
  // Panel structure
  containers: PanelContainer[];  // Layout containers
  panels: Panel[];               // All panels
  views: View[];                 // Active view instances
  
  // View token state (for view selector toolbar)
  viewTokens: {
    registered: Array<{ id: string; label: string }>;
    activeSlots: Array<string | null>;  // Fixed length: 5
    tokenOrder: string[];               // User-defined order
  };
  
  // Active view tracking
  activeView: string | null;
  
  // Layout configuration
  layout: {
    expansion: {
      left: boolean;
      right: boolean;
      bottom: boolean;
    };
    overlayView: string | null;
    viewportWidthMode: '1x' | '2x' | '3x' | '4x' | '5x' | 'auto';
    mainAreaCount: 1 | 2 | 3 | 4 | 5;
    mainViewOrder: string[];
  };
  
  // Toolbar positioning
  toolbars: {
    positions: Record<string, ToolbarPos>;
    activePicker: string | null;
  };
  
  // Extensible properties (your app's state)
  dock: any;    // Custom dock configuration
  theme: any;   // Custom theme settings
  auth: {       // Authentication state
    isLoggedIn: boolean;
    user?: { uid: string; email?: string } | null;
  };
  
  // Add your own namespaces:
  app?: any;      // App-specific state
  feature?: any;  // Feature state
  data?: any;     // Data cache
}
```

---

## Custom Handler Example

```typescript
// Register custom handler for your actions
import { frameworkHandlers } from '@project/framework';

frameworkHandlers.register('app/updateSelection', (state, action) => {
  const { itemId } = action.payload ?? {};
  
  return {
    state: {
      ...state,
      app: {
        ...state.app,
        selectedItemId: itemId,
        selectionTimestamp: Date.now()
      }
    },
    followUps: [
      // Optional: trigger additional actions
      { type: 'data/fetchDetails', payload: { itemId } }
    ]
  };
});

// Use in view
dispatchUiEvent(this, 'app/updateSelection', {
  itemId: 'item-123'
});
```

---

## Development Workflow

### 1. Create a New View

```typescript
// 1. Define view component
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-new-view')
export class MyNewView extends LitElement {
  @property({ type: Object }) data: any = null;
  
  render() {
    return html`<div>My View: ${this.data?.label}</div>`;
  }
}

// 2. Register view
ViewRegistry.register({
  id: 'my-new-view',
  name: 'My New View',
  title: 'My New View',
  tag: 'my-new-view',
  icon: 'star',
  component: () => import('./my-new-view')
});

// 3. Add to initial state (optional)
const initialState: UIState = {
  views: [
    {
      id: 'my-new-view-1',
      name: 'My New View',
      component: 'my-new-view',
      data: { label: 'Instance 1' }
    }
  ],
  // ... rest of state
};
```

### 2. Add Custom Actions

```typescript
// 1. Define handler
frameworkHandlers.register('myapp/customAction', (state, action) => {
  const { value } = action.payload ?? {};
  
  return {
    state: {
      ...state,
      myapp: {
        ...state.myapp,
        customValue: value
      }
    },
    followUps: []
  };
});

// 2. Dispatch from view
dispatchUiEvent(this, 'myapp/customAction', {
  value: 'new-value'
});

// 3. Consume in view
render() {
  const myapp = this.uiState?.myapp as { customValue?: string };
  return html`<div>Value: ${myapp?.customValue}</div>`;
}
```

### 3. Share State Between Views

```typescript
// View A: Producer
private updateSharedState(data: any) {
  dispatchUiEvent(this, 'context/patch', {
    namespace: 'app',
    changes: { sharedData: data }
  });
}

// View B: Consumer
render() {
  const app = this.uiState?.app as { sharedData?: any };
  const shared = app?.sharedData;
  
  return html`<div>Shared: ${JSON.stringify(shared)}</div>`;
}
```

---

## Testing Patterns

### Unit Testing Views

```typescript
import { fixture, html } from '@open-wc/testing';
import { MyView } from './my-view';

describe('MyView', () => {
  it('renders with data', async () => {
    const el = await fixture<MyView>(html`
      <my-view .data=${{ label: 'Test' }}></my-view>
    `);
    
    expect(el.shadowRoot?.textContent).to.include('Test');
  });
});
```

### Integration Testing Actions

```typescript
import { dispatchUiEvent } from '@project/framework';

describe('Action Flow', () => {
  it('updates state on action', () => {
    const root = document.querySelector('framework-root');
    
    dispatchUiEvent(root!, 'layout/setExpansion', {
      side: 'left',
      expanded: true
    });
    
    // Wait for update
    requestAnimationFrame(() => {
      const state = (root as any).state;
      expect(state.layout.expansion.left).to.be.true;
    });
  });
});
```

---

## Common Patterns

### Loading States

```typescript
render() {
  const data = this.uiState?.data;
  
  if (!data) {
    return html`<div>Loading...</div>`;
  }
  
  if (data.error) {
    return html`<div>Error: ${data.error}</div>`;
  }
  
  return html`<div>Data: ${data.value}</div>`;
}
```

### Conditional Rendering

```typescript
render() {
  const auth = this.uiState?.auth;
  
  return html`
    ${auth?.isLoggedIn
      ? html`<authenticated-content></authenticated-content>`
      : html`<login-prompt></login-prompt>`
    }
  `;
}
```

### Event Delegation

```typescript
private handleAction(event: CustomEvent) {
  const { action, payload } = event.detail;
  
  dispatchUiEvent(this, `app/${action}`, payload);
}

render() {
  return html`
    <child-component
      @action=${this.handleAction}
    ></child-component>
  `;
}
```

---

## Performance Optimization

### 1. Memo Computed Values

```typescript
private computedValue: any = null;
private computedDeps: any[] = [];

private getComputed() {
  const deps = [this.uiState?.auth, this.uiState?.data];
  
  if (JSON.stringify(deps) !== JSON.stringify(this.computedDeps)) {
    this.computedValue = expensiveComputation(deps);
    this.computedDeps = deps;
  }
  
  return this.computedValue;
}
```

### 2. Debounce Updates

```typescript
private updateTimeout?: number;

private scheduleUpdate(data: any) {
  clearTimeout(this.updateTimeout);
  
  this.updateTimeout = window.setTimeout(() => {
    dispatchUiEvent(this, 'app/update', { data });
  }, 300);
}
```

### 3. Virtual Scrolling

```typescript
// For large lists, use virtual scrolling
import { virtualize } from '@lit-labs/virtualizer';

render() {
  const items = this.uiState?.data?.items ?? [];
  
  return html`
    <div class="list">
      ${virtualize({
        items,
        renderItem: (item) => html`<list-item .item=${item}></list-item>`
      })}
    </div>
  `;
}
```

---

## Debugging Tips

### 1. Enable Framework Logging

```typescript
import { setFrameworkLogger } from '@project/framework';

setFrameworkLogger({
  info: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.debug
});
```

### 2. Inspect State

```typescript
// In browser console
__frameworkRoot.state
__frameworkRoot.state.layout
__frameworkRoot.state.panels
```

### 3. Monitor Events

```typescript
window.addEventListener('ui-event', (event) => {
  console.log('Event:', event.detail);
});
```

### 4. Trace Action Flow

```typescript
// Add to handler
frameworkHandlers.register('myapp/action', (state, action) => {
  console.log('Before:', state.myapp);
  
  const nextState = { ...state, myapp: { ...action.payload } };
  
  console.log('After:', nextState.myapp);
  
  return { state: nextState, followUps: [] };
});
```

---

## Migration from Old Pattern

### Before (Incorrect)

```typescript
// Direct mutation ❌
this.uiState.layout.expansion.left = true;
this.requestUpdate();
```

### After (Correct)

```typescript
// Event dispatch ✅
dispatchUiEvent(this, 'layout/setExpansion', {
  side: 'left',
  expanded: true
});
```

---

## Summary

✅ **DO:**
- Use `ContextConsumer` for read-only state access
- Dispatch actions via `dispatchUiEvent`
- Register views with `ViewRegistry`
- Keep views decoupled via context
- Follow unidirectional data flow

❌ **DON'T:**
- Mutate context state directly
- Reference other views directly
- Bypass handler registry
- Mix concerns (UI + business logic)
- Store state outside framework

---

## Resources

- **Framework Docs**: `/packages/framework/README.md`
- **Architecture Doc**: `/panel_toolbar_architecture_high_level_analysis_brief.md`
- **Type Definitions**: `/packages/framework/src/types/`
- **Handler Registry**: `/packages/framework/src/handlers/handler-registry.ts`
- **Context Provider**: `/packages/framework/src/state/context.ts`

---

**Built with BuildBlox Framework**  
*Clean architecture • Type-safe • Extensible*
