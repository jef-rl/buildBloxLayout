# BuildBlox Framework - Development Guide

## Purpose

This guide is for developers who want to **extend or modify the BuildBlox Framework itself**. It covers:

1. 🏗️ **Framework Architecture**: Core systems and design patterns
2. 🔧 **Extension Points**: How to add new capabilities
3. 📦 **Package Structure**: Organization and module boundaries
4. ✅ **Testing Strategies**: Framework-level testing
5. 🚀 **Publishing**: Release and versioning practices

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Systems](#core-systems)
3. [Adding New Features](#adding-new-features)
4. [Handler System](#handler-system)
5. [View Registry System](#view-registry-system)
6. [State Management](#state-management)
7. [Component Development](#component-development)
8. [Testing Framework Code](#testing-framework-code)
9. [Best Practices](#best-practices)
10. [Publishing Changes](#publishing-changes)

---

## Architecture Overview

### System Layers

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (User views, custom handlers, etc.)    │
├─────────────────────────────────────────┤
│         Framework API Layer             │
│  (Public exports, typed interfaces)     │
├─────────────────────────────────────────┤
│         Core Systems Layer              │
│  (State, Registry, Handlers, Context)   │
├─────────────────────────────────────────┤
│         Component Layer                 │
│  (Layout, Controls, UI primitives)      │
├─────────────────────────────────────────┤
│         Foundation Layer                │
│  (Lit, Context API, Event System)       │
└─────────────────────────────────────────┘
```

### Key Design Principles

1. **Separation of Concerns**: Each system has a single responsibility
2. **Unidirectional Data Flow**: State flows down, events flow up
3. **Type Safety**: TypeScript throughout with strict typing
4. **Extensibility**: Open for extension, closed for modification
5. **Testability**: Pure functions and dependency injection

---

## Core Systems

### 1. State Management (`/src/state/`)

**Purpose**: Centralized state container with subscription model

**Key Files**:
- `ui-state.ts` - Core state class and types
- `context.ts` - Lit context provider/consumer setup
- `selectors.ts` - State selector functions

**Responsibilities**:
- Store complete UI state
- Notify subscribers on changes
- Provide state hydration/serialization
- Manage panel and view instances

**Extension Points**:

```typescript
// Add new state properties via UIState interface
// File: src/types/ui-state.ts
export type UIState = {
  // ... existing properties
  
  // Add your namespace
  myFeature?: {
    config: any;
    data: any;
  };
};

// Add selectors
// File: src/state/selectors.ts
export const getMyFeatureState = (state: UIState) => state.myFeature;
```

---

### 2. Handler Registry (`/src/handlers/`)

**Purpose**: Action dispatching and state transformation

**Key Files**:
- `handler-registry.ts` - Core registry implementation
- `workspace/` - Built-in workspace handlers
- `layout/` - Built-in layout handlers

**Responsibilities**:
- Register action handlers
- Route actions to handlers
- Execute handler chains (followUps)
- Validate state transformations

**Extension Points**:

```typescript
// Add new handler category
// File: src/handlers/my-feature/my-feature.handlers.ts
import type { UIState } from '../../types/ui-state';
import type { HandlerAction, HandlerResult } from '../handler-registry';

export const myFeatureHandlers = {
  'myfeature/action': (state: UIState, action: HandlerAction): HandlerResult<UIState> => {
    return {
      state: {
        ...state,
        myFeature: action.payload
      },
      followUps: []
    };
  }
};

// Register in core
// File: src/handlers/handler-registry.ts
import { myFeatureHandlers } from './my-feature/my-feature.handlers';

export const coreHandlers: Record<string, ReducerHandler<UIState>> = {
  ...existingHandlers,
  ...myFeatureHandlers
};
```

---

### 3. View Registry (`/src/registry/`)

**Purpose**: View definition storage and lifecycle management

**Key Files**:
- `ViewRegistry.ts` - Registry implementation
- `ViewRegistryInstance.ts` - Singleton export

**Responsibilities**:
- Store view definitions
- Lazy-load view components
- Create view instances
- Emit registry change events

**Extension Points**:

```typescript
// Extend view definition
// File: src/types/panel.ts
export interface ViewDefinition {
  id: string;
  name: string;
  component: ViewComponent;
  title: string;
  tag: string;
  icon: string;
  
  // Add custom metadata
  category?: string;
  permissions?: string[];
  configuration?: Record<string, any>;
}

// Add registry hooks
// File: src/registry/ViewRegistry.ts
class ViewRegistry extends EventTarget {
  // Add pre-registration hook
  private beforeRegister(definition: ViewDefinition): void {
    // Validation, transformation, etc.
  }
  
  // Add post-creation hook
  private afterCreate(view: View, definition: ViewDefinition): void {
    // Initialization, tracking, etc.
  }
}
```

---

### 4. Context System (`/src/state/context.ts`)

**Purpose**: React-style context for state distribution

**Key Files**:
- `context.ts` - Context creation and types

**Responsibilities**:
- Create typed context
- Provide context value
- Enable component subscription

**Extension Points**:

```typescript
// Extend context value
// File: src/state/ui-state.ts
export interface UiStateContextValue {
  state: UiStateContextState;
  dispatch: (payload: { type: string; [key: string]: unknown }) => void;
  
  // Add utilities
  getView?: (viewId: string) => View | null;
  getPanel?: (panelId: string) => Panel | null;
}

// Update provider
// File: src/components/layout/FrameworkRoot.ts
private provider = new ContextProvider(this, {
  context: uiStateContext,
  initialValue: {
    state: this.getContextState(),
    dispatch: this.dispatchUiAction,
    
    // Add utility methods
    getView: (viewId: string) => this.getView(viewId),
    getPanel: (panelId: string) => this.getPanel(panelId)
  }
});
```

---

## Adding New Features

### Feature Development Checklist

- [ ] Define types in `/src/types/`
- [ ] Add state properties to `UIState`
- [ ] Create handlers in `/src/handlers/`
- [ ] Register handlers in handler registry
- [ ] Add selectors to `/src/state/selectors.ts`
- [ ] Create components if needed
- [ ] Export public API from `/src/index.ts`
- [ ] Write tests
- [ ] Update documentation

### Example: Adding a "Themes" Feature

**1. Define Types**

```typescript
// File: src/types/theme.ts
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
  customColors?: Record<string, string>;
}

export interface ThemeState {
  current: ThemeConfig;
  available: ThemeConfig[];
  userOverrides?: Partial<ThemeConfig>;
}
```

**2. Update UIState**

```typescript
// File: src/types/ui-state.ts
export type UIState = {
  // ... existing
  theme: ThemeState;
};
```

**3. Create Handlers**

```typescript
// File: src/handlers/theme/theme.handlers.ts
import type { UIState } from '../../types/ui-state';
import type { HandlerAction, HandlerResult } from '../handler-registry';
import type { ThemeConfig } from '../../types/theme';

export const themeHandlers: Record<string, (state: UIState, action: HandlerAction) => HandlerResult<UIState>> = {
  'theme/setMode': (state, action) => {
    const mode = action.payload?.mode as ThemeMode;
    
    return {
      state: {
        ...state,
        theme: {
          ...state.theme,
          current: {
            ...state.theme.current,
            mode
          }
        }
      },
      followUps: [
        { type: 'theme/applyStyles', payload: { mode } }
      ]
    };
  },
  
  'theme/setColors': (state, action) => {
    const colors = action.payload?.colors as Partial<ThemeConfig>;
    
    return {
      state: {
        ...state,
        theme: {
          ...state.theme,
          current: {
            ...state.theme.current,
            ...colors
          }
        }
      },
      followUps: []
    };
  },
  
  'theme/applyStyles': (state, action) => {
    // Side effect: apply CSS variables
    const mode = action.payload?.mode;
    document.documentElement.setAttribute('data-theme', mode);
    
    return { state, followUps: [] };
  }
};
```

**4. Register Handlers**

```typescript
// File: src/handlers/handler-registry.ts
import { themeHandlers } from './theme/theme.handlers';

export const coreHandlers: Record<string, ReducerHandler<UIState>> = {
  // ... existing
  ...themeHandlers
};
```

**5. Add Selectors**

```typescript
// File: src/state/selectors.ts
export const getTheme = (state: UIState) => state.theme;
export const getThemeMode = (state: UIState) => state.theme.current.mode;
export const getThemeColors = (state: UIState) => ({
  primary: state.theme.current.primaryColor,
  accent: state.theme.current.accentColor
});
```

**6. Create Component (if needed)**

```typescript
// File: src/components/controls/ThemeSwitcher.ts
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../state/context';
import { dispatchUiEvent } from '../../utils/dispatcher';
import type { UiStateContextValue } from '../../state/ui-state';

@customElement('theme-switcher')
export class ThemeSwitcher extends LitElement {
  private uiState: UiStateContextValue['state'] | null = null;
  
  private _consumer = new ContextConsumer(this, {
    context: uiStateContext,
    subscribe: true,
    callback: (value: UiStateContextValue | undefined) => {
      this.uiState = value?.state ?? null;
      this.requestUpdate();
    }
  });
  
  static styles = css`
    :host {
      display: inline-flex;
      gap: 8px;
    }
    
    button {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button.active {
      background: var(--primary-color, #3b82f6);
      color: white;
    }
  `;
  
  private setMode(mode: ThemeMode) {
    dispatchUiEvent(this, 'theme/setMode', { mode });
  }
  
  render() {
    const currentMode = this.uiState?.theme?.current?.mode ?? 'auto';
    
    return html`
      <button
        class=${currentMode === 'light' ? 'active' : ''}
        @click=${() => this.setMode('light')}
      >
        Light
      </button>
      <button
        class=${currentMode === 'dark' ? 'active' : ''}
        @click=${() => this.setMode('dark')}
      >
        Dark
      </button>
      <button
        class=${currentMode === 'auto' ? 'active' : ''}
        @click=${() => this.setMode('auto')}
      >
        Auto
      </button>
    `;
  }
}
```

**7. Export Public API**

```typescript
// File: src/index.ts
export * from './types/theme';
export * from './components/controls/ThemeSwitcher';
export { getTheme, getThemeMode, getThemeColors } from './state/selectors';
```

**8. Write Tests**

```typescript
// File: src/handlers/theme/__tests__/theme.handlers.test.ts
import { describe, it, expect } from 'vitest';
import { themeHandlers } from '../theme.handlers';

describe('theme/setMode', () => {
  it('updates theme mode', () => {
    const initialState = {
      theme: {
        current: { mode: 'light', primaryColor: '#000', accentColor: '#000' },
        available: []
      }
    } as UIState;
    
    const result = themeHandlers['theme/setMode'](initialState, {
      type: 'theme/setMode',
      payload: { mode: 'dark' }
    });
    
    expect(result.state.theme.current.mode).toBe('dark');
    expect(result.followUps).toHaveLength(1);
    expect(result.followUps[0].type).toBe('theme/applyStyles');
  });
});
```

---

## Handler System

### Handler Anatomy

```typescript
type ReducerHandler<TState> = (
  state: TState,      // Current state (immutable)
  action: HandlerAction  // Action with type and payload
) => HandlerResult<TState>;  // New state + follow-up actions

interface HandlerResult<TState> {
  state: TState;           // New state (must be new object)
  followUps: HandlerAction[];  // Subsequent actions to dispatch
}
```

### Handler Best Practices

**1. Pure Functions**

```typescript
// ✅ CORRECT - Pure function
'feature/update': (state, action) => {
  return {
    state: {
      ...state,
      feature: { ...state.feature, value: action.payload.value }
    },
    followUps: []
  };
}

// ❌ WRONG - Mutates state
'feature/update': (state, action) => {
  state.feature.value = action.payload.value;  // MUTATION!
  return { state, followUps: [] };
}
```

**2. Immutable Updates**

```typescript
// ✅ CORRECT - Spreads to create new objects
'nested/update': (state, action) => {
  return {
    state: {
      ...state,
      parent: {
        ...state.parent,
        child: {
          ...state.parent.child,
          value: action.payload.value
        }
      }
    },
    followUps: []
  };
}
```

**3. Type Safety**

```typescript
// ✅ CORRECT - Typed payload
interface UpdatePayload {
  value: string;
  timestamp: number;
}

'feature/update': (state, action) => {
  const payload = action.payload as UpdatePayload;
  // Type-safe access to payload.value, payload.timestamp
}

// ❌ WRONG - Untyped access
'feature/update': (state, action) => {
  const value = action.payload.value;  // No type safety
}
```

**4. Follow-up Actions**

```typescript
// ✅ CORRECT - Chain related actions
'user/login': (state, action) => {
  const user = action.payload?.user;
  
  return {
    state: {
      ...state,
      auth: { isLoggedIn: true, user }
    },
    followUps: [
      { type: 'user/fetchPreferences', payload: { userId: user.id } },
      { type: 'analytics/trackLogin', payload: { userId: user.id } }
    ]
  };
}
```

**5. Error Handling**

```typescript
// ✅ CORRECT - Graceful degradation
'data/fetch': (state, action) => {
  try {
    const data = processData(action.payload);
    return {
      state: {
        ...state,
        data: { value: data, error: null }
      },
      followUps: []
    };
  } catch (error) {
    return {
      state: {
        ...state,
        data: { value: null, error: error.message }
      },
      followUps: [
        { type: 'notification/show', payload: { message: 'Failed to process data' } }
      ]
    };
  }
}
```

---

## View Registry System

### Registry Lifecycle

```
Register → Lazy Load → Create → Mount → Update → Unmount
```

### Extending the Registry

**1. Add View Metadata**

```typescript
// File: src/registry/ViewRegistry.ts
class ViewRegistry extends EventTarget {
  private readonly viewMetadata: Map<string, ViewMetadata> = new Map();
  
  register(definition: ViewDefinition, metadata?: ViewMetadata): void {
    this.viewDefinitions.set(definition.id, definition);
    
    if (metadata) {
      this.viewMetadata.set(definition.id, metadata);
    }
    
    this.emitRegistryChange({
      type: 'register',
      viewId: definition.id,
      definition,
      total: this.viewDefinitions.size
    });
  }
  
  getMetadata(id: string): ViewMetadata | undefined {
    return this.viewMetadata.get(id);
  }
}

interface ViewMetadata {
  category?: string;
  permissions?: string[];
  preload?: boolean;
}
```

**2. Add Component Cache Control**

```typescript
class ViewRegistry extends EventTarget {
  clearCache(viewId?: string): void {
    if (viewId) {
      this.componentCache.delete(viewId);
    } else {
      this.componentCache.clear();
    }
  }
  
  preloadComponent(viewId: string): Promise<void> {
    return this.getComponent(viewId).then(() => {});
  }
}
```

**3. Add Lifecycle Hooks**

```typescript
type ViewLifecycleHook = (view: View, definition: ViewDefinition) => void;

class ViewRegistry extends EventTarget {
  private hooks = {
    beforeCreate: [] as ViewLifecycleHook[],
    afterCreate: [] as ViewLifecycleHook[]
  };
  
  onBeforeCreate(hook: ViewLifecycleHook): () => void {
    this.hooks.beforeCreate.push(hook);
    return () => {
      const index = this.hooks.beforeCreate.indexOf(hook);
      if (index > -1) this.hooks.beforeCreate.splice(index, 1);
    };
  }
  
  createView(viewId: string, data?: unknown): View | undefined {
    const definition = this.get(viewId);
    if (!definition) return undefined;
    
    // Before hooks
    this.hooks.beforeCreate.forEach(hook => hook(null as any, definition));
    
    const view: View = {
      id: `${viewId}-${Date.now()}`,
      name: definition.title,
      component: viewId,
      data: data || {},
      element: document.createElement(definition.tag) as LitElement
    };
    
    // After hooks
    this.hooks.afterCreate.forEach(hook => hook(view, definition));
    
    return view;
  }
}
```

---

## State Management

### State Update Patterns

**1. Simple Property Update**

```typescript
'simple/update': (state, action) => ({
  state: { ...state, value: action.payload.value },
  followUps: []
})
```

**2. Nested Property Update**

```typescript
'nested/update': (state, action) => ({
  state: {
    ...state,
    parent: {
      ...state.parent,
      child: action.payload.value
    }
  },
  followUps: []
})
```

**3. Array Updates**

```typescript
// Add item
'array/add': (state, action) => ({
  state: {
    ...state,
    items: [...state.items, action.payload.item]
  },
  followUps: []
})

// Remove item
'array/remove': (state, action) => ({
  state: {
    ...state,
    items: state.items.filter(item => item.id !== action.payload.id)
  },
  followUps: []
})

// Update item
'array/update': (state, action) => ({
  state: {
    ...state,
    items: state.items.map(item =>
      item.id === action.payload.id
        ? { ...item, ...action.payload.updates }
        : item
    )
  },
  followUps: []
})
```

**4. Conditional Updates**

```typescript
'conditional/update': (state, action) => {
  const shouldUpdate = checkCondition(state, action);
  
  if (!shouldUpdate) {
    return { state, followUps: [] };
  }
  
  return {
    state: { ...state, value: action.payload.value },
    followUps: [{ type: 'notification/show', payload: { message: 'Updated' } }]
  };
}
```

### State Validation

```typescript
// File: src/utils/state-validator.ts
export function validateState(state: UIState): string[] {
  const errors: string[] = [];
  
  // Validate panels
  if (!Array.isArray(state.panels)) {
    errors.push('state.panels must be an array');
  }
  
  // Validate layout
  if (state.layout.mainAreaCount < 1 || state.layout.mainAreaCount > 5) {
    errors.push('layout.mainAreaCount must be between 1 and 5');
  }
  
  // Validate view references
  state.panels.forEach(panel => {
    if (panel.viewId && !state.views.find(v => v.id === panel.viewId)) {
      errors.push(`Panel ${panel.id} references non-existent view ${panel.viewId}`);
    }
  });
  
  return errors;
}

// Use in handler
'state/replace': (state, action) => {
  const nextState = action.payload?.state;
  const errors = validateState(nextState);
  
  if (errors.length > 0) {
    console.error('State validation failed:', errors);
    return { state, followUps: [] };
  }
  
  return { state: nextState, followUps: [] };
}
```

---

## Component Development

### Framework Component Guidelines

**1. Use Lit Element Base**

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('my-component')
export class MyComponent extends LitElement {
  @property({ type: String }) label = '';
  @state() private internalState = '';
  
  static styles = css`
    :host {
      display: block;
    }
  `;
  
  render() {
    return html`<div>${this.label}</div>`;
  }
}
```

**2. Context Consumption Pattern**

```typescript
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../state/context';
import type { UiStateContextValue } from '../../state/ui-state';

@customElement('context-aware-component')
export class ContextAwareComponent extends LitElement {
  private uiState: UiStateContextValue['state'] | null = null;
  
  private _consumer = new ContextConsumer(this, {
    context: uiStateContext,
    subscribe: true,
    callback: (value: UiStateContextValue | undefined) => {
      this.uiState = value?.state ?? null;
      this.requestUpdate();
    }
  });
  
  render() {
    const data = this.uiState?.someData;
    return html`<div>${data}</div>`;
  }
}
```

**3. Event Dispatch Pattern**

```typescript
import { dispatchUiEvent } from '../../utils/dispatcher';

@customElement('action-component')
export class ActionComponent extends LitElement {
  private handleAction() {
    dispatchUiEvent(this, 'myaction/type', {
      payload: 'data'
    });
  }
  
  render() {
    return html`
      <button @click=${this.handleAction}>
        Trigger Action
      </button>
    `;
  }
}
```

**4. Proper Cleanup**

```typescript
@customElement('cleanup-component')
export class CleanupComponent extends LitElement {
  private subscription?: () => void;
  
  connectedCallback() {
    super.connectedCallback();
    this.subscription = someService.subscribe(this.handleUpdate);
  }
  
  disconnectedCallback() {
    if (this.subscription) {
      this.subscription();
      this.subscription = undefined;
    }
    super.disconnectedCallback();
  }
  
  private handleUpdate = () => {
    this.requestUpdate();
  };
}
```

### Component Composition

```typescript
// Base component
@customElement('base-toolbar')
export class BaseToolbar extends LitElement {
  @property({ type: String }) orientation: 'row' | 'column' = 'row';
  
  protected getOrientation() {
    return this.orientation;
  }
  
  static styles = css`
    :host {
      display: flex;
    }
    :host([orientation="row"]) {
      flex-direction: row;
    }
    :host([orientation="column"]) {
      flex-direction: column;
    }
  `;
}

// Extended component
@customElement('custom-toolbar')
export class CustomToolbar extends BaseToolbar {
  @property({ type: Array }) items: any[] = [];
  
  render() {
    return html`
      <div class="toolbar ${this.getOrientation()}">
        ${this.items.map(item => html`
          <button>${item.label}</button>
        `)}
      </div>
    `;
  }
}
```

---

## Testing Framework Code

### Unit Testing Handlers

```typescript
// File: src/handlers/__tests__/my-handler.test.ts
import { describe, it, expect } from 'vitest';
import { myHandler } from '../my-handler';
import type { UIState } from '../../types/ui-state';

describe('myHandler', () => {
  const createMockState = (): UIState => ({
    panels: [],
    views: [],
    containers: [],
    viewTokens: {
      registered: [],
      activeSlots: [null, null, null, null, null],
      tokenOrder: []
    },
    activeView: null,
    layout: {
      expansion: { left: false, right: false, bottom: false },
      overlayView: null,
      viewportWidthMode: 'auto',
      mainAreaCount: 1,
      mainViewOrder: []
    },
    toolbars: {
      positions: {},
      activePicker: null
    },
    dock: {},
    theme: {},
    auth: { isLoggedIn: false }
  });
  
  it('updates state correctly', () => {
    const state = createMockState();
    const result = myHandler(state, {
      type: 'my/action',
      payload: { value: 'test' }
    });
    
    expect(result.state).not.toBe(state); // New object
    expect(result.state.myProperty).toBe('test');
    expect(result.followUps).toEqual([]);
  });
  
  it('triggers follow-up actions', () => {
    const state = createMockState();
    const result = myHandler(state, {
      type: 'my/action',
      payload: { triggerFollowup: true }
    });
    
    expect(result.followUps).toHaveLength(1);
    expect(result.followUps[0].type).toBe('followup/action');
  });
});
```

### Integration Testing Components

```typescript
// File: src/components/__tests__/my-component.test.ts
import { fixture, html, expect } from '@open-wc/testing';
import { MyComponent } from '../my-component';

describe('MyComponent', () => {
  it('renders correctly', async () => {
    const el = await fixture<MyComponent>(html`
      <my-component label="Test"></my-component>
    `);
    
    expect(el.shadowRoot?.textContent).to.include('Test');
  });
  
  it('dispatches events', async () => {
    const el = await fixture<MyComponent>(html`
      <my-component></my-component>
    `);
    
    let eventFired = false;
    el.addEventListener('ui-event', () => {
      eventFired = true;
    });
    
    el.shadowRoot?.querySelector('button')?.click();
    
    expect(eventFired).to.be.true;
  });
});
```

### End-to-End Testing

```typescript
// File: e2e/framework.spec.ts
import { test, expect } from '@playwright/test';

test('framework initialization', async ({ page }) => {
  await page.goto('/');
  
  // Check framework root exists
  const root = await page.locator('framework-root');
  await expect(root).toBeVisible();
  
  // Check panels render
  const panels = await page.locator('.main-panel');
  await expect(panels).toHaveCount(3);
});

test('panel expansion', async ({ page }) => {
  await page.goto('/');
  
  // Click expand button
  await page.click('[data-testid="expand-left"]');
  
  // Check panel is expanded
  const leftPanel = await page.locator('.expander-left');
  await expect(leftPanel).not.toHaveClass(/collapsed/);
});
```

---

## Best Practices

### 1. Type Safety

**DO**:
```typescript
// Use strict types
interface MyPayload {
  id: string;
  value: number;
}

'my/action': (state, action) => {
  const payload = action.payload as MyPayload;
  // Type-safe access
}
```

**DON'T**:
```typescript
// Avoid any
'my/action': (state, action) => {
  const payload = action.payload as any; // ❌
}
```

### 2. Immutability

**DO**:
```typescript
// Always create new objects
return {
  state: {
    ...state,
    nested: { ...state.nested, value: newValue }
  },
  followUps: []
};
```

**DON'T**:
```typescript
// Never mutate
state.nested.value = newValue; // ❌
return { state, followUps: [] };
```

### 3. Pure Functions

**DO**:
```typescript
// Handlers should be pure
'pure/handler': (state, action) => {
  const result = calculateValue(action.payload);
  return {
    state: { ...state, value: result },
    followUps: []
  };
}
```

**DON'T**:
```typescript
// Avoid side effects in handlers
'impure/handler': (state, action) => {
  localStorage.setItem('value', action.payload); // ❌
  return { state, followUps: [] };
}
```

### 4. Separation of Concerns

**DO**:
```typescript
// Keep components focused
@customElement('ui-component')
export class UiComponent extends LitElement {
  // Only UI logic
  render() {
    return html`<div>UI</div>`;
  }
}

// Business logic in handlers
'business/logic': (state, action) => {
  const result = complexBusinessLogic(state, action);
  return { state: result, followUps: [] };
}
```

### 5. Error Handling

**DO**:
```typescript
'safe/handler': (state, action) => {
  try {
    const result = riskyOperation(action.payload);
    return {
      state: { ...state, result },
      followUps: []
    };
  } catch (error) {
    console.error('Handler error:', error);
    return {
      state: { ...state, error: error.message },
      followUps: [
        { type: 'notification/error', payload: { message: 'Operation failed' } }
      ]
    };
  }
}
```

---

## Publishing Changes

### Version Management

```json
// package.json
{
  "name": "@project/framework",
  "version": "1.2.3",
  "scripts": {
    "version:patch": "npm version patch",
    "version:minor": "npm version minor",
    "version:major": "npm version major"
  }
}
```

### Semantic Versioning

- **MAJOR**: Breaking changes (2.0.0)
- **MINOR**: New features, backward compatible (1.1.0)
- **PATCH**: Bug fixes (1.0.1)

### Release Checklist

- [ ] All tests passing
- [ ] Update CHANGELOG.md
- [ ] Update version in package.json
- [ ] Build distribution (`npm run build`)
- [ ] Commit changes
- [ ] Create git tag
- [ ] Push to repository
- [ ] Publish to npm (if applicable)
- [ ] Update documentation

### Breaking Change Template

```markdown
## Breaking Changes in v2.0.0

### Handler System

**BEFORE**:
```typescript
frameworkHandlers.register('action', (state, payload) => {
  return { ...state, value: payload };
});
```

**AFTER**:
```typescript
frameworkHandlers.register('action', (state, action) => {
  return {
    state: { ...state, value: action.payload },
    followUps: []
  };
});
```

**Migration Guide**:
1. Update handler signature to accept `action` instead of `payload`
2. Return object with `state` and `followUps` properties
3. Access payload via `action.payload`
```

---

## Advanced Topics

### Custom Event Bus

```typescript
// File: src/utils/event-bus.ts
type EventHandler = (detail: any) => void;

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  
  on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    
    return () => this.off(event, handler);
  }
  
  off(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }
  
  emit(event: string, detail?: any): void {
    this.handlers.get(event)?.forEach(handler => handler(detail));
  }
}

export const eventBus = new EventBus();
```

### Middleware System

```typescript
// File: src/handlers/middleware.ts
type Middleware = (
  state: UIState,
  action: HandlerAction,
  next: (state: UIState, action: HandlerAction) => HandlerResult<UIState>
) => HandlerResult<UIState>;

const loggingMiddleware: Middleware = (state, action, next) => {
  console.log('Before:', action.type);
  const result = next(state, action);
  console.log('After:', action.type);
  return result;
};

export function applyMiddleware(
  handler: ReducerHandler<UIState>,
  middlewares: Middleware[]
): ReducerHandler<UIState> {
  return (state, action) => {
    let index = 0;
    
    const next = (s: UIState, a: HandlerAction): HandlerResult<UIState> => {
      if (index >= middlewares.length) {
        return handler(s, a);
      }
      const middleware = middlewares[index++];
      return middleware(s, a, next);
    };
    
    return next(state, action);
  };
}
```

### Plugin Architecture

```typescript
// File: src/plugins/plugin-manager.ts
export interface FrameworkPlugin {
  id: string;
  name: string;
  version: string;
  
  install(context: PluginContext): void;
  uninstall?(): void;
}

export interface PluginContext {
  registerHandler(type: string, handler: ReducerHandler<UIState>): void;
  registerView(definition: ViewDefinition): void;
  registerMiddleware(middleware: Middleware): void;
  
  getState(): UIState;
  dispatch(type: string, payload?: any): void;
}

export class PluginManager {
  private plugins = new Map<string, FrameworkPlugin>();
  
  install(plugin: FrameworkPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} already installed`);
    }
    
    const context = this.createContext();
    plugin.install(context);
    this.plugins.set(plugin.id, plugin);
  }
  
  uninstall(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin?.uninstall) {
      plugin.uninstall();
    }
    this.plugins.delete(pluginId);
  }
  
  private createContext(): PluginContext {
    return {
      registerHandler: (type, handler) => {
        frameworkHandlers.register(type, handler);
      },
      registerView: (definition) => {
        viewRegistry.register(definition);
      },
      registerMiddleware: (middleware) => {
        // Implementation
      },
      getState: () => uiState.getState(),
      dispatch: (type, payload) => {
        const root = document.querySelector('framework-root');
        if (root) {
          dispatchUiEvent(root, type, payload);
        }
      }
    };
  }
}
```

---

## Summary

### Framework Extension Checklist

- [ ] **Types First**: Define types in `/src/types/`
- [ ] **State Schema**: Update `UIState` interface
- [ ] **Handlers**: Create pure handler functions
- [ ] **Registration**: Register handlers in handler registry
- [ ] **Components**: Build UI components if needed
- [ ] **Tests**: Write comprehensive tests
- [ ] **Documentation**: Update docs and examples
- [ ] **Public API**: Export from `/src/index.ts`

### Key Principles

1. ✅ **Type Safety**: TypeScript throughout
2. ✅ **Immutability**: Never mutate state
3. ✅ **Pure Functions**: No side effects in handlers
4. ✅ **Separation of Concerns**: Single responsibility
5. ✅ **Testability**: Unit test everything
6. ✅ **Documentation**: Clear, comprehensive docs

---

## Resources

- **Framework Source**: `/packages/framework/src/`
- **Type Definitions**: `/packages/framework/src/types/`
- **Handler Registry**: `/packages/framework/src/handlers/handler-registry.ts`
- **View Registry**: `/packages/framework/src/registry/ViewRegistry.ts`
- **Component Examples**: `/packages/framework/src/components/`
- **Test Examples**: `/packages/framework/src/**/__tests__/`

---

**BuildBlox Framework Development**  
*Extensible • Type-Safe • Well-Tested*
