# BuildBlox Framework - Development Guide

> **Comprehensive guide for extending and modifying the BuildBlox Framework**

## 📚 Table of Contents

### Getting Started
- [Overview & Purpose](#overview--purpose)
- [Quick Reference](#quick-reference)
- [Architecture Philosophy](#architecture-philosophy)

### Core Architecture
- [The View-Context-Handler Protocol](#the-view-context-handler-protocol)
- [System Layers](#system-layers)
- [Design Principles](#design-principles)

### Core Systems
- [State Management](#state-management)
- [Handler Registry](#handler-registry)
- [View Registry](#view-registry)
- [Context System](#context-system)
- [Event System](#event-system)

### Development Guide
- [Adding New Features](#adding-new-features)
- [View Development](#view-development)
- [Handler Development](#handler-development)
- [Component Development](#component-development)
- [State Extension](#state-extension)

### Advanced Topics
- [Performance Optimization](#performance-optimization)
- [Plugin Architecture](#plugin-architecture)
- [Middleware System](#middleware-system)
- [Custom Event Bus](#custom-event-bus)

### Testing
- [Testing Strategy](#testing-strategy)
- [Unit Testing Handlers](#unit-testing-handlers)
- [Integration Testing Components](#integration-testing-components)
- [End-to-End Testing](#end-to-end-testing)

### Best Practices
- [Code Patterns](#code-patterns)
- [Error Handling](#error-handling)
- [Debugging Techniques](#debugging-techniques)
- [Common Pitfalls](#common-pitfalls)

### Publishing
- [Version Management](#version-management)
- [Release Process](#release-process)
- [Breaking Changes](#breaking-changes)

---

## Overview & Purpose

This guide is for developers who want to **extend or modify the BuildBlox Framework itself**. It covers framework internals, extension points, and best practices for maintaining the framework's architecture.

### Who This Guide Is For

- **Framework Contributors**: Developers adding core features to the framework
- **Plugin Developers**: Building extensions that integrate deeply with the framework
- **Advanced Users**: Creating custom handlers, state systems, or components
- **Maintainers**: Understanding architecture for debugging and optimization

### What You'll Learn

1. 🏗️ **Framework Architecture**: Core systems and design patterns
2. 🔧 **Extension Points**: How to add new capabilities safely
3. 📦 **Package Structure**: Organization and module boundaries
4. ✅ **Testing Strategies**: Comprehensive testing approaches
5. 🚀 **Publishing**: Release and versioning practices

---

## Quick Reference

### Common Tasks

```typescript
// Add a new state namespace
export type UIState = {
  // ... existing
  myFeature: MyFeatureState;
};

// Register a handler
export const myHandlers = {
  'myfeature/action': (state, action) => ({
    state: { ...state, myFeature: action.payload },
    followUps: []
  })
};

// Create a view component
@customElement('my-view')
export class MyView extends LitElement {
  @consume({ context: uiStateContext, subscribe: true })
  @property({ attribute: false })
  uiState?: UiStateContextValue;
  
  render() {
    return html`<div>${this.uiState?.state.myFeature}</div>`;
  }
}

// Register a view
bootstrapFramework({
  views: [{
    id: 'my-view',
    name: 'My View',
    title: 'My Custom View',
    tag: 'my-view',
    icon: '📝',
    component: () => import('./my-view')
  }],
  state: initialState
});
```

### File Structure

```
packages/framework/src/
├── components/          # UI components
│   ├── layout/         # Layout components (Root, Panels, etc.)
│   ├── controls/       # Control components (Buttons, etc.)
│   └── ui/             # UI primitives (Icons, etc.)
├── handlers/           # State handlers
│   ├── layout/         # Layout-related handlers
│   ├── workspace/      # Workspace handlers
│   └── handler-registry.ts
├── registry/           # View registry
│   ├── ViewRegistry.ts
│   └── ViewRegistryInstance.ts
├── state/              # State management
│   ├── ui-state.ts
│   ├── context.ts
│   └── selectors.ts
├── types/              # TypeScript types
│   ├── core.ts
│   ├── events.ts
│   ├── panel.ts
│   └── ui-state.ts
├── utils/              # Utilities
│   ├── dispatcher.ts
│   ├── logger.ts
│   └── helpers.ts
├── bootstrap.ts        # Framework initialization
└── index.ts            # Public exports
```

---

## Architecture Philosophy

### The View-Context-Handler Protocol

The framework is built on a unidirectional data flow pattern called the **View-Context-Handler Protocol**. This is the fundamental contract that governs how all components interact with state.

#### The Three Pillars

**1. Views are Pure Presentation**

Views are components that display data and report user intentions. They never modify state directly.

Local component state is allowed and may be mutated when it is strictly internal and not exposed through context or shared objects. UI-only behavior (hover flags, focus state, transient animation toggles, local measurements) can live in the component. Any complex processing or state that must be shared across components must be handled through handlers and stored in global state.

```typescript
// ✅ CORRECT: View reads state and dispatches actions
@customElement('todo-view')
export class TodoView extends LitElement {
  @consume({ context: uiStateContext, subscribe: true })
  uiState?: UiStateContextValue;
  
  private handleAddTodo() {
    dispatchUiEvent(this, 'todos/add', { 
      text: 'New todo' 
    });
  }
  
  render() {
    const todos = this.uiState?.state.todos ?? [];
    return html`
      <ul>${todos.map(t => html`<li>${t.text}</li>`)}</ul>
      <button @click=${this.handleAddTodo}>Add</button>
    `;
  }
}
```

```typescript
// ❌ WRONG: View mutates state directly
@customElement('bad-view')
export class BadView extends LitElement {
  private handleAdd() {
    // Never do this!
    this.uiState.state.todos.push({ text: 'New' });
  }
}
```

**2. Context Provides Read-Only State**

The framework maintains a single, centralized state object. Views access this through the Context API, which provides a read-only snapshot and a dispatch function.

```typescript
// Context structure
interface UiStateContextValue {
  state: UiStateContextState;  // Read-only state snapshot
  dispatch: (payload: Action) => void;  // Dispatch function
}

// Views consume context
@consume({ context: uiStateContext, subscribe: true })
@property({ attribute: false })
uiState?: UiStateContextValue;
```

**3. Handlers are the Only State Mutators**

All state changes flow through registered handlers. Handlers are pure functions that receive current state and an action, then return new state.

```typescript
// Handler signature
type ReducerHandler<S> = (
  state: S,
  action: HandlerAction
) => HandlerResult<S>;

// Handler result
interface HandlerResult<S> {
  state: S;              // New state (immutable update)
  followUps: Action[];   // Optional subsequent actions
}

// Example handler
export const todoHandlers = {
  'todos/add': (state, action) => ({
    state: {
      ...state,
      todos: [...state.todos, action.payload]
    },
    followUps: [
      { type: 'todos/save', payload: { id: action.payload.id } }
    ]
  })
};
```

#### Data Flow Diagram

```
┌──────────────────────────────────────────────────────────┐
│                     User Interaction                     │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  View dispatches action via dispatchUiEvent()            │
│  Example: dispatchUiEvent(this, 'todos/add', data)       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  Event bubbles up DOM to FrameworkRoot                   │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  Handler Registry routes action to handler               │
│  Handler executes: newState = handler(oldState, action)  │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  State updated (immutably)                               │
│  Context providers notified                              │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  All consuming views receive new state                   │
│  Views re-render with updated data                       │
└──────────────────────────────────────────────────────────┘
```

#### Why This Architecture?

**Complete Visibility**: Every state change is an explicit action that can be logged, inspected, and replayed.

**Natural Testing Boundaries**: Handlers are pure functions testable in isolation. Views can be tested with mock context.

**Graceful Scaling**: New features add new handlers without modifying existing code. Views don't need to know about features they don't use.

**Predictable State**: With read-only context and centralized handlers, you always know how state changes.

**Time-Travel Debugging**: Action logs enable replay and inspection of state transitions.

---

## System Layers

The framework is organized into five distinct layers, each with specific responsibilities:

```
┌─────────────────────────────────────────────────────────┐
│              Application Layer                          │
│  User-defined views, custom handlers, app logic         │
│  Dependencies: Framework API Layer                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Framework API Layer                        │
│  Public exports, typed interfaces, documented API       │
│  Dependencies: Core Systems Layer                       │
│  Exports: bootstrapFramework, dispatchUiEvent, types    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Core Systems Layer                         │
│  State management, Handler registry, View registry      │
│  Context distribution, Event routing                    │
│  Dependencies: Component Layer, Foundation Layer        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Component Layer                            │
│  Layout components, Controls, UI primitives             │
│  Dependencies: Foundation Layer                         │
│  Components: FrameworkRoot, Panels, Expanders           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Foundation Layer                           │
│  Lit Element, Context API, Event System                 │
│  External dependencies                                  │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

**Application Layer**
- User-defined views and components
- Custom handlers for business logic
- Application-specific state extensions
- NOT part of the framework itself

**Framework API Layer**
- Public exports (`/src/index.ts`)
- Type definitions for framework users
- Documented interfaces and functions
- Stability guarantees

**Core Systems Layer**
- State container and management
- Handler registry and action routing
- View registry and lifecycle
- Context provider/consumer setup

**Component Layer**
- Reusable UI components
- Layout management (panels, expanders)
- Control components (buttons, inputs)
- Framework-specific widgets

**Foundation Layer**
- Lit Element base class
- Browser APIs
- Third-party dependencies

---

## Design Principles

### 1. Separation of Concerns

Each system has a single, well-defined responsibility:

```typescript
// ✅ Handler handles business logic
export const handlers = {
  'user/login': (state, action) => {
    const user = authenticateUser(action.payload);
    return {
      state: { ...state, auth: { user, isLoggedIn: true } },
      followUps: [{ type: 'user/loadPreferences' }]
    };
  }
};

// ✅ View handles presentation
@customElement('user-profile')
export class UserProfile extends LitElement {
  @consume({ context: uiStateContext, subscribe: true })
  uiState?: UiStateContextValue;
  
  render() {
    const user = this.uiState?.state.auth?.user;
    return html`<div class="profile">${user?.name}</div>`;
  }
}
```

### 2. Unidirectional Data Flow

State flows down through context, events flow up through handlers:

```
        Context (down)
          │
          ▼
    ┌──────────┐
    │   View   │
    └──────────┘
          │
          ▼
       Events (up)
          │
          ▼
    ┌──────────┐
    │ Handlers │
    └──────────┘
          │
          ▼
        State
```

### 3. Type Safety

TypeScript throughout with strict typing:

```typescript
// Strongly typed state
export type UIState = {
  panels: Panel[];
  views: View[];
  auth: AuthState;
  // ... all properties typed
};

// Strongly typed actions
interface TodoAddAction {
  type: 'todos/add';
  payload: { text: string; priority: number };
}

// Strongly typed handlers
const handler: ReducerHandler<UIState> = (state, action) => {
  // TypeScript ensures return type matches
  return {
    state: { ...state, todos: [...state.todos, action.payload] },
    followUps: []
  };
};
```

### 4. Extensibility (Open/Closed Principle)

Open for extension, closed for modification:

```typescript
// ✅ EXTEND: Add new handlers without modifying core
export const myFeatureHandlers = {
  'myfeature/action': (state, action) => ({
    state: { ...state, myFeature: action.payload },
    followUps: []
  })
};

// Register new handlers
frameworkHandlers.register('myfeature/action', myFeatureHandlers['myfeature/action']);

// ❌ MODIFY: Don't change existing handler behavior
// Instead, create a new handler with a different name
```

### 5. Testability

Pure functions and dependency injection enable isolated testing:

```typescript
// Handler is a pure function - easy to test
describe('todos/add', () => {
  it('adds todo to state', () => {
    const state = { todos: [] };
    const result = handlers['todos/add'](state, {
      type: 'todos/add',
      payload: { text: 'Test', id: '1' }
    });
    
    expect(result.state.todos).toHaveLength(1);
    expect(result.state.todos[0].text).toBe('Test');
  });
});
```

---

## State Management

**Location**: `/src/state/`

### Purpose

Centralized state container with subscription model providing single source of truth for application state.

### Key Files

- **`ui-state.ts`**: Core state class, types, and state container implementation
- **`context.ts`**: Lit context provider/consumer setup
- **`selectors.ts`**: State selector functions for derived data

### State Structure

```typescript
export type UIState = {
  // Structural state
  panels: Panel[];              // Panel definitions
  views: View[];                // View instances
  containers: PanelContainer[]; // Container definitions
  
  // Active state
  activeView: string | null;    // Currently focused view
  
  // Layout state
  layout: {
    expansion: {
      left: boolean;
      right: boolean;
      bottom: boolean;
    };
    overlayView: string | null;
    viewportWidthMode: ViewportWidthMode;
    mainAreaCount: number;
    mainViewOrder: string[];
  };
  
  // View tokens (for main area views)
  viewTokens: ViewTokenState;
  
  // Toolbar state
  toolbars: {
    positions: Record<string, ToolbarPosition>;
    activePicker: string | null;
  };
  
  // Dock state (drag & drop)
  dock: Record<string, any>;
  
  // Application namespaces (extensible)
  [key: string]: any;  // Custom app state goes here
};
```

### UIState Class

```typescript
// File: src/state/ui-state.ts
export class UIStateContainer {
  private state: UIState;
  private subscribers: Set<(state: UIState) => void> = new Set();
  
  constructor(initialState?: Partial<UIState>) {
    this.state = this.createDefaultState(initialState);
  }
  
  getState(): UIState {
    return this.state;
  }
  
  setState(newState: UIState): void {
    this.state = newState;
    this.notifySubscribers();
  }
  
  subscribe(callback: (state: UIState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
  
  private notifySubscribers(): void {
    this.subscribers.forEach(cb => cb(this.state));
  }
  
  private createDefaultState(partial?: Partial<UIState>): UIState {
    return {
      panels: [],
      views: [],
      containers: [],
      activeView: null,
      viewTokens: {
        registered: [],
        activeSlots: [null, null, null, null, null],
        tokenOrder: []
      },
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
      ...partial
    };
  }
}
```

### Extending State

To add custom application state:

```typescript
// 1. Define your state type
// File: src/types/my-feature.ts
export interface MyFeatureState {
  data: any[];
  loading: boolean;
  error: string | null;
}

// 2. Extend UIState
// File: src/types/ui-state.ts
export type UIState = {
  // ... existing properties
  
  // Add your namespace
  myFeature?: MyFeatureState;
};

// 3. Add selectors (optional but recommended)
// File: src/state/selectors.ts
export const getMyFeatureData = (state: UIState) => 
  state.myFeature?.data ?? [];

export const getMyFeatureLoading = (state: UIState) => 
  state.myFeature?.loading ?? false;

export const getMyFeatureError = (state: UIState) => 
  state.myFeature?.error ?? null;
```

### State Hydration

Initialize state on bootstrap:

```typescript
// File: src/bootstrap.ts or application entry
import { bootstrapFramework } from '@project/framework';

const initialState: Partial<UIState> = {
  myFeature: {
    data: [],
    loading: false,
    error: null
  },
  layout: {
    expansion: { left: true, right: false, bottom: false },
    // ... other layout config
  }
};

bootstrapFramework({
  views: viewDefinitions,
  state: initialState
});
```

---

## Handler Registry

**Location**: `/src/handlers/`

### Purpose

Action dispatching system that routes user actions to pure state transformation functions.

### Key Files

- **`handler-registry.ts`**: Core registry implementation with action routing
- **`layout/`**: Built-in layout handlers (expansion, viewport, overlay)
- **`workspace/`**: Built-in workspace handlers (panels, views, tokens)

### Handler Signature

```typescript
type ReducerHandler<S> = (
  state: S,
  action: HandlerAction
) => HandlerResult<S>;

interface HandlerAction {
  type: string;
  payload?: any;
  [key: string]: any;
}

interface HandlerResult<S> {
  state: S;              // New state (must be immutable update)
  followUps: Action[];   // Subsequent actions to dispatch
}
```

### Creating Handlers

```typescript
// File: src/handlers/my-feature/my-feature.handlers.ts
import type { UIState } from '../../types/ui-state';
import type { HandlerAction, HandlerResult } from '../handler-registry';

export const myFeatureHandlers = {
  'myfeature/loadData': (state: UIState, action: HandlerAction): HandlerResult<UIState> => {
    return {
      state: {
        ...state,
        myFeature: {
          ...state.myFeature,
          loading: true,
          error: null
        }
      },
      followUps: []
    };
  },
  
  'myfeature/dataLoaded': (state, action) => ({
    state: {
      ...state,
      myFeature: {
        data: action.payload.data,
        loading: false,
        error: null
      }
    },
    followUps: []
  }),
  
  'myfeature/dataError': (state, action) => ({
    state: {
      ...state,
      myFeature: {
        ...state.myFeature,
        loading: false,
        error: action.payload.error
      }
    },
    followUps: [
      { type: 'notification/error', payload: { message: action.payload.error } }
    ]
  })
};
```

### Registering Handlers

```typescript
// File: src/handlers/handler-registry.ts
import { myFeatureHandlers } from './my-feature/my-feature.handlers';
import { layoutHandlers } from './layout/layout.handlers';
import { workspaceHandlers } from './workspace/workspace.handlers';

export const coreHandlers: Record<string, ReducerHandler<UIState>> = {
  ...layoutHandlers,
  ...workspaceHandlers,
  ...myFeatureHandlers,
  // Add more handler groups here
};

// Registry implementation
class HandlerRegistry {
  private handlers = new Map<string, ReducerHandler<UIState>>();
  
  register(type: string, handler: ReducerHandler<UIState>): void {
    this.handlers.set(type, handler);
  }
  
  handle(state: UIState, action: HandlerAction): HandlerResult<UIState> {
    const handler = this.handlers.get(action.type);
    
    if (!handler) {
      console.warn(`No handler registered for action: ${action.type}`);
      return { state, followUps: [] };
    }
    
    return handler(state, action);
  }
}

export const frameworkHandlers = new HandlerRegistry();

// Register all core handlers
Object.entries(coreHandlers).forEach(([type, handler]) => {
  frameworkHandlers.register(type, handler);
});
```

### Handler Best Practices

**Always Return New State Objects**

```typescript
// ✅ CORRECT: Immutable update
'myfeature/update': (state, action) => ({
  state: {
    ...state,
    myFeature: {
      ...state.myFeature,
      value: action.payload
    }
  },
  followUps: []
})

// ❌ WRONG: Mutation
'myfeature/update': (state, action) => {
  state.myFeature.value = action.payload;  // Never mutate!
  return { state, followUps: [] };
}
```

**Use Follow-Up Actions for Orchestration**

```typescript
// ✅ CORRECT: Orchestrate multiple steps
'user/login': (state, action) => ({
  state: {
    ...state,
    auth: { user: action.payload, isLoggedIn: true }
  },
  followUps: [
    { type: 'user/loadPreferences' },
    { type: 'user/loadNotifications' },
    { type: 'analytics/track', payload: { event: 'login' } }
  ]
})
```

**Keep Handlers Synchronous**

```typescript
// ✅ CORRECT: Synchronous state update, async as side effect
'data/load': (state, action) => {
  // Trigger async load (via service, saga, etc.)
  dataService.load(action.payload).then(data => {
    dispatchUiEvent(root, 'data/loaded', { data });
  });
  
  return {
    state: { ...state, loading: true },
    followUps: []
  };
}

// ❌ WRONG: Async handler
'data/load': async (state, action) => {
  const data = await fetch('/api/data');
  return { state: { ...state, data }, followUps: [] };
}
```

**Add Error Handling**

```typescript
'data/save': (state, action) => {
  try {
    const validated = validateData(action.payload);
    
    return {
      state: {
        ...state,
        data: validated,
        lastSaved: Date.now()
      },
      followUps: [
        { type: 'notification/success', payload: { message: 'Saved!' } }
      ]
    };
  } catch (error) {
    return {
      state: {
        ...state,
        error: error.message
      },
      followUps: [
        { type: 'notification/error', payload: { message: error.message } }
      ]
    };
  }
}
```

---

## View Registry

**Location**: `/src/registry/`

### Purpose

Centralized registry for view definitions with lazy-loading and lifecycle management.

### Key Files

- **`ViewRegistry.ts`**: Registry class implementation
- **`ViewRegistryInstance.ts`**: Singleton export

### View Definition

```typescript
export interface ViewDefinition {
  id: string;                        // Unique identifier
  name: string;                      // Human-readable name
  title: string;                     // Display title
  tag: string;                       // Custom element tag name
  icon: string;                      // Icon (emoji or class)
  component: () => Promise<any>;     // Lazy-load function
  
  // Optional extensions
  category?: string;                 // For grouping/filtering
  permissions?: string[];            // Access control
  configuration?: Record<string, any>;  // View-specific config
}
```

### View Instance

```typescript
export interface View {
  id: string;              // Instance ID (unique per instance)
  name: string;            // View name from definition
  component: string;       // View definition ID
  data: Record<string, unknown>;  // Instance-specific data
  element: LitElement;     // The actual DOM element
}
```

### Registry API

```typescript
// File: src/registry/ViewRegistry.ts
class ViewRegistry extends EventTarget {
  private viewDefinitions = new Map<string, ViewDefinition>();
  
  // Register a view definition
  register(definition: ViewDefinition): void {
    if (this.viewDefinitions.has(definition.id)) {
      console.warn(`View "${definition.id}" already registered`);
      return;
    }
    
    this.viewDefinitions.set(definition.id, definition);
    this.emitRegistryChange({
      type: 'registered',
      viewId: definition.id
    });
  }
  
  // Get view definition by ID
  get(id: string): ViewDefinition | undefined {
    return this.viewDefinitions.get(id);
  }
  
  // Lazy-load view component
  async getComponent(id: string): Promise<any | undefined> {
    const definition = this.get(id);
    if (!definition) return undefined;
    
    try {
      return await definition.component();
    } catch (error) {
      console.error(`Failed to load component for "${id}"`, error);
      return undefined;
    }
  }
  
  // Create view instance
  createView(viewId: string, data?: unknown): View | undefined {
    const definition = this.get(viewId);
    if (!definition) {
      console.warn(`View definition not found for "${viewId}"`);
      return undefined;
    }
    
    return {
      id: `${viewId}-${Date.now()}`,
      name: definition.title,
      component: viewId,
      data: data || {},
      element: document.createElement(definition.tag) as LitElement
    };
  }
  
  // Get all registered views
  getAllViews(): ViewDefinition[] {
    return Array.from(this.viewDefinitions.values());
  }
  
  // Listen for registry changes
  onRegistryChange(
    listener: (event: CustomEvent<ViewRegistryChangeDetail>) => void
  ): () => void {
    const handler = listener as EventListener;
    this.addEventListener('registry-change', handler);
    return () => this.removeEventListener('registry-change', handler);
  }
  
  private emitRegistryChange(detail: ViewRegistryChangeDetail) {
    this.dispatchEvent(
      new CustomEvent<ViewRegistryChangeDetail>('registry-change', { detail })
    );
  }
}

export const viewRegistry = new ViewRegistry();
```

### Registering Views

```typescript
// File: application bootstrap (e.g., main.ts)
import { bootstrapFramework } from '@project/framework';

// Lazy-load functions
const loadEditorView = () => import('./views/editor-view');
const loadPreviewView = () => import('./views/preview-view');
const loadPropertiesView = () => import('./views/properties-view');

bootstrapFramework({
  views: [
    {
      id: 'editor',
      name: 'Editor',
      title: 'Code Editor',
      tag: 'editor-view',
      icon: '📝',
      component: loadEditorView,
      category: 'editing',
      permissions: ['editor.access']
    },
    {
      id: 'preview',
      name: 'Preview',
      title: 'Live Preview',
      tag: 'preview-view',
      icon: '👁️',
      component: loadPreviewView,
      category: 'viewing'
    },
    {
      id: 'properties',
      name: 'Properties',
      title: 'Property Inspector',
      tag: 'properties-view',
      icon: '⚙️',
      component: loadPropertiesView,
      category: 'editing'
    }
  ],
  state: initialState
});
```

### View Lifecycle

```
1. Definition Registration
   └─> viewRegistry.register(definition)
   
2. View Creation (when assigned to panel)
   └─> viewRegistry.createView(viewId, data)
       ├─> Creates element: document.createElement(tag)
       ├─> Assigns data properties
       └─> Returns View instance
   
3. Component Loading (lazy)
   └─> viewRegistry.getComponent(viewId)
       └─> Calls definition.component() (import)
   
4. View Mounting
   └─> panel.appendChild(view.element)
   
5. View Unmounting
   └─> panel.removeChild(view.element)
   └─> Element cleanup (disconnectedCallback)
```

---

## Context System

**Location**: `/src/state/context.ts`

### Purpose

Lit Context API for distributing state to components in a React-style context pattern.

### Context Definition

```typescript
// File: src/state/context.ts
import { createContext } from '@lit/context';
import type { UiStateContextValue } from './ui-state';

export const uiStateContext = createContext<UiStateContextValue>(
  Symbol('ui-state-context')
);
```

### Context Value Interface

```typescript
// File: src/state/ui-state.ts
export interface UiStateContextValue {
  state: UiStateContextState;  // Read-only state snapshot
  dispatch: (payload: { type: string; [key: string]: unknown }) => void;
}

export type UiStateContextState = Omit<UIState, 'dispatch'>;
```

### Providing Context

Context is provided by `FrameworkRoot`:

```typescript
// File: src/components/layout/FrameworkRoot.ts
@customElement('framework-root')
export class FrameworkRoot extends LitElement {
  @state()
  private state: UIState = createDefaultState();
  
  private provider = new ContextProvider(this, {
    context: uiStateContext,
    initialValue: {
      state: this.getContextState(),
      dispatch: this.dispatchUiAction
    }
  });
  
  private getContextState(): UiStateContextState {
    return {
      panels: this.state.panels,
      views: this.state.views,
      activeView: this.state.activeView,
      layout: this.state.layout,
      // ... all state properties
    };
  }
  
  private dispatchUiAction = (payload: { type: string; [key: string]: unknown }) => {
    const result = frameworkHandlers.handle(this.state, payload);
    this.state = result.state;
    this.provider.setValue({
      state: this.getContextState(),
      dispatch: this.dispatchUiAction
    });
    
    // Process follow-ups
    result.followUps.forEach(action => {
      this.dispatchUiAction(action);
    });
  };
}
```

### Consuming Context

Views consume context using the `@consume` decorator:

```typescript
import { consume } from '@lit/context';
import { uiStateContext } from '@project/framework';

@customElement('my-view')
export class MyView extends LitElement {
  @consume({ context: uiStateContext, subscribe: true })
  @property({ attribute: false })
  uiState?: UiStateContextValue;
  
  render() {
    const data = this.uiState?.state.myFeature;
    
    return html`
      <div class="my-view">
        ${data ? html`<div>${JSON.stringify(data)}</div>` : html`<div>No data</div>`}
      </div>
    `;
  }
}
```

### Extending Context

To add utility methods to context:

```typescript
// 1. Extend the interface
// File: src/state/ui-state.ts
export interface UiStateContextValue {
  state: UiStateContextState;
  dispatch: (payload: Action) => void;
  
  // Add utilities
  getView?: (viewId: string) => View | null;
  getPanel?: (panelId: string) => Panel | null;
  isExpanded?: (side: 'left' | 'right' | 'bottom') => boolean;
}

// 2. Update provider in FrameworkRoot
private provider = new ContextProvider(this, {
  context: uiStateContext,
  initialValue: {
    state: this.getContextState(),
    dispatch: this.dispatchUiAction,
    
    // Utility methods
    getView: (viewId: string) => 
      this.state.views.find(v => v.id === viewId) ?? null,
    
    getPanel: (panelId: string) => 
      this.state.panels.find(p => p.id === panelId) ?? null,
    
    isExpanded: (side: 'left' | 'right' | 'bottom') => 
      this.state.layout.expansion[side] ?? false
  }
});
```

---

## Event System

**Location**: `/src/utils/dispatcher.ts`

### Purpose

Standardized event dispatching for framework actions.

### Dispatch Function

```typescript
// File: src/utils/dispatcher.ts
export function dispatchUiEvent(
  element: Element,
  type: string,
  payload?: Record<string, unknown>
): void {
  const event = new CustomEvent('ui-event', {
    bubbles: true,
    composed: true,
    detail: {
      type,
      ...payload
    }
  });
  
  element.dispatchEvent(event);
}
```

### Usage in Views

```typescript
@customElement('action-button')
export class ActionButton extends LitElement {
  @property() actionType = '';
  @property() payload: any = {};
  
  private handleClick() {
    dispatchUiEvent(this, this.actionType, this.payload);
  }
  
  render() {
    return html`
      <button @click=${this.handleClick}>
        <slot></slot>
      </button>
    `;
  }
}
```

### Event Flow

```
Component
  └─> dispatchUiEvent(this, 'action/type', payload)
      └─> Creates CustomEvent with type 'ui-event'
          └─> Event bubbles up DOM tree
              └─> Captured by FrameworkRoot
                  └─> Extracts action details from event.detail
                      └─> Calls frameworkHandlers.handle(state, action)
                          └─> Handler returns new state
                              └─> State updated, context notified
                                  └─> Views re-render
```

---

## Adding New Features

### Feature Development Checklist

When adding a new feature to the framework:

- [ ] **Define types** in `/src/types/`
- [ ] **Extend UIState** interface with new state properties
- [ ] **Create handlers** in `/src/handlers/your-feature/`
- [ ] **Register handlers** in handler registry
- [ ] **Add selectors** to `/src/state/selectors.ts` (if needed)
- [ ] **Create components** if UI components are needed
- [ ] **Export public API** from `/src/index.ts`
- [ ] **Write tests** for handlers and components
- [ ] **Update documentation** with examples

### Complete Example: Adding a "Notifications" Feature

#### 1. Define Types

```typescript
// File: src/types/notifications.ts
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
  dismissible?: boolean;
  duration?: number;  // Auto-dismiss after ms
}

export interface NotificationsState {
  items: Notification[];
  maxVisible: number;
}
```

#### 2. Extend UIState

```typescript
// File: src/types/ui-state.ts
import type { NotificationsState } from './notifications';

export type UIState = {
  // ... existing properties
  
  notifications: NotificationsState;
};
```

#### 3. Create Handlers

```typescript
// File: src/handlers/notifications/notifications.handlers.ts
import type { UIState } from '../../types/ui-state';
import type { HandlerAction, HandlerResult } from '../handler-registry';
import type { Notification } from '../../types/notifications';

export const notificationsHandlers = {
  'notification/add': (state: UIState, action: HandlerAction): HandlerResult<UIState> => {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      type: action.payload.type || 'info',
      message: action.payload.message,
      timestamp: Date.now(),
      dismissible: action.payload.dismissible ?? true,
      duration: action.payload.duration
    };
    
    const items = [...state.notifications.items, notification];
    const maxVisible = state.notifications.maxVisible || 5;
    
    // Keep only most recent notifications
    const visibleItems = items.slice(-maxVisible);
    
    const followUps: any[] = [];
    
    // Auto-dismiss if duration specified
    if (notification.duration) {
      setTimeout(() => {
        dispatchUiEvent(
          document.querySelector('framework-root')!,
          'notification/dismiss',
          { id: notification.id }
        );
      }, notification.duration);
    }
    
    return {
      state: {
        ...state,
        notifications: {
          ...state.notifications,
          items: visibleItems
        }
      },
      followUps
    };
  },
  
  'notification/dismiss': (state, action) => ({
    state: {
      ...state,
      notifications: {
        ...state.notifications,
        items: state.notifications.items.filter(n => n.id !== action.payload.id)
      }
    },
    followUps: []
  }),
  
  'notification/dismissAll': (state) => ({
    state: {
      ...state,
      notifications: {
        ...state.notifications,
        items: []
      }
    },
    followUps: []
  }),
  
  // Convenience handlers
  'notification/info': (state, action) => 
    notificationsHandlers['notification/add'](state, {
      ...action,
      payload: { ...action.payload, type: 'info' }
    }),
  
  'notification/success': (state, action) => 
    notificationsHandlers['notification/add'](state, {
      ...action,
      payload: { ...action.payload, type: 'success' }
    }),
  
  'notification/warning': (state, action) => 
    notificationsHandlers['notification/add'](state, {
      ...action,
      payload: { ...action.payload, type: 'warning' }
    }),
  
  'notification/error': (state, action) => 
    notificationsHandlers['notification/add'](state, {
      ...action,
      payload: { ...action.payload, type: 'error' }
    })
};
```

#### 4. Register Handlers

```typescript
// File: src/handlers/handler-registry.ts
import { notificationsHandlers } from './notifications/notifications.handlers';

export const coreHandlers: Record<string, ReducerHandler<UIState>> = {
  ...existingHandlers,
  ...notificationsHandlers
};
```

#### 5. Add Selectors

```typescript
// File: src/state/selectors.ts
export const getNotifications = (state: UIState) => 
  state.notifications?.items ?? [];

export const getNotificationCount = (state: UIState) => 
  state.notifications?.items.length ?? 0;

export const getLatestNotification = (state: UIState) => {
  const items = state.notifications?.items ?? [];
  return items[items.length - 1] ?? null;
};
```

#### 6. Create Component

```typescript
// File: src/components/notifications/NotificationCenter.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { uiStateContext } from '../../state/context';
import { dispatchUiEvent } from '../../utils/dispatcher';
import type { UiStateContextValue } from '../../state/ui-state';
import type { Notification } from '../../types/notifications';

@customElement('notification-center')
export class NotificationCenter extends LitElement {
  @consume({ context: uiStateContext, subscribe: true })
  @property({ attribute: false })
  uiState?: UiStateContextValue;
  
  private handleDismiss(id: string) {
    dispatchUiEvent(this, 'notification/dismiss', { id });
  }
  
  render() {
    const notifications = this.uiState?.state.notifications?.items ?? [];
    
    return html`
      <div class="notification-center">
        ${notifications.map(notification => html`
          <div class="notification notification--${notification.type}">
            <span class="notification__message">${notification.message}</span>
            ${notification.dismissible ? html`
              <button 
                class="notification__dismiss"
                @click=${() => this.handleDismiss(notification.id)}
              >
                ×
              </button>
            ` : ''}
          </div>
        `)}
      </div>
    `;
  }
  
  static styles = css`
    .notification-center {
      position: fixed;
      top: 1rem;
      right: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      z-index: 9999;
    }
    
    .notification {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      min-width: 300px;
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .notification--info { border-left: 4px solid #3b82f6; }
    .notification--success { border-left: 4px solid #10b981; }
    .notification--warning { border-left: 4px solid #f59e0b; }
    .notification--error { border-left: 4px solid #ef4444; }
    
    .notification__message {
      flex: 1;
    }
    
    .notification__dismiss {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
    }
    
    .notification__dismiss:hover {
      color: #374151;
    }
  `;
}
```

#### 7. Export Public API

```typescript
// File: src/index.ts
export * from './components/notifications/NotificationCenter';
export * from './types/notifications';
export { 
  getNotifications, 
  getNotificationCount, 
  getLatestNotification 
} from './state/selectors';
```

#### 8. Write Tests

```typescript
// File: src/handlers/notifications/__tests__/notifications.handlers.test.ts
import { describe, it, expect } from 'vitest';
import { notificationsHandlers } from '../notifications.handlers';
import type { UIState } from '../../../types/ui-state';

describe('notifications handlers', () => {
  const createMockState = (): UIState => ({
    // ... default state
    notifications: {
      items: [],
      maxVisible: 5
    }
  });
  
  describe('notification/add', () => {
    it('adds notification to state', () => {
      const state = createMockState();
      const result = notificationsHandlers['notification/add'](state, {
        type: 'notification/add',
        payload: {
          type: 'info',
          message: 'Test notification'
        }
      });
      
      expect(result.state.notifications.items).toHaveLength(1);
      expect(result.state.notifications.items[0].message).toBe('Test notification');
      expect(result.state.notifications.items[0].type).toBe('info');
    });
    
    it('respects maxVisible limit', () => {
      const state = createMockState();
      state.notifications.items = Array(5).fill(null).map((_, i) => ({
        id: `${i}`,
        type: 'info',
        message: `Message ${i}`,
        timestamp: Date.now()
      }));
      
      const result = notificationsHandlers['notification/add'](state, {
        type: 'notification/add',
        payload: { message: 'New message' }
      });
      
      expect(result.state.notifications.items).toHaveLength(5);
    });
  });
  
  describe('notification/dismiss', () => {
    it('removes notification by id', () => {
      const state = createMockState();
      state.notifications.items = [{
        id: 'test-1',
        type: 'info',
        message: 'Test',
        timestamp: Date.now()
      }];
      
      const result = notificationsHandlers['notification/dismiss'](state, {
        type: 'notification/dismiss',
        payload: { id: 'test-1' }
      });
      
      expect(result.state.notifications.items).toHaveLength(0);
    });
  });
});
```

#### 9. Usage Example

```typescript
// In your application
import { dispatchUiEvent } from '@project/framework';

// Show success notification
dispatchUiEvent(element, 'notification/success', {
  message: 'Item saved successfully!',
  duration: 3000
});

// Show error notification
dispatchUiEvent(element, 'notification/error', {
  message: 'Failed to load data',
  dismissible: true
});

// In your view component
render() {
  return html`
    <div class="app">
      <notification-center></notification-center>
      <!-- rest of your app -->
    </div>
  `;
}
```

---

## View Development

### View Component Structure

A view is a Lit element that consumes framework state and dispatches actions:

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { uiStateContext } from '@project/framework';
import { dispatchUiEvent } from '@project/framework';
import type { UiStateContextValue } from '@project/framework';

@customElement('example-view')
export class ExampleView extends LitElement {
  // Context consumption (read-only state access)
  @consume({ context: uiStateContext, subscribe: true })
  @property({ attribute: false })
  uiState?: UiStateContextValue;
  
  // View-specific properties (passed from panel)
  @property({ type: Object }) data: any = {};
  
  // Internal component state (not shared)
  @state() private localState = '';
  
  // Event handlers
  private handleAction() {
    dispatchUiEvent(this, 'myfeature/action', {
      value: this.localState
    });
  }
  
  // Render method
  render() {
    const featureState = this.uiState?.state.myFeature;
    
    return html`
      <div class="example-view">
        <h2>Example View</h2>
        
        <!-- Display framework state -->
        <div class="state-display">
          ${featureState ? html`
            <pre>${JSON.stringify(featureState, null, 2)}</pre>
          ` : html`
            <p>No state</p>
          `}
        </div>
        
        <!-- User interaction -->
        <input 
          .value=${this.localState}
          @input=${(e: Event) => {
            this.localState = (e.target as HTMLInputElement).value;
          }}
        />
        
        <button @click=${this.handleAction}>
          Dispatch Action
        </button>
      </div>
    `;
  }
  
  // Styles
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
    }
    
    .example-view {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .state-display {
      flex: 1;
      overflow: auto;
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 0.25rem;
    }
    
    input {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 0.25rem;
    }
    
    button {
      padding: 0.5rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
    }
    
    button:hover {
      background: #2563eb;
    }
  `;
  
  // Lifecycle (optional)
  connectedCallback() {
    super.connectedCallback();
    // Component mounted
    console.log('View mounted');
  }
  
  disconnectedCallback() {
    // Cleanup
    console.log('View unmounted');
    super.disconnectedCallback();
  }
}
```

### View Best Practices

**1. Use Context for Framework State**

```typescript
// ✅ CORRECT
@consume({ context: uiStateContext, subscribe: true })
uiState?: UiStateContextValue;

render() {
  const data = this.uiState?.state.myFeature;
  return html`<div>${data}</div>`;
}

// ❌ WRONG: Don't store state in component
@state() myFeatureData = {};  // Don't duplicate framework state
```

**2. Keep Local State Truly Local**

```typescript
// ✅ CORRECT: Local UI state
@state() private isExpanded = false;
@state() private searchQuery = '';
@state() private selectedTab = 0;

// ❌ WRONG: Shared state should be in framework
@state() private userData = {};  // Should be in framework state
```

**3. Dispatch Actions, Don't Mutate**

```typescript
// ✅ CORRECT
private handleSave() {
  dispatchUiEvent(this, 'data/save', {
    value: this.localValue
  });
}

// ❌ WRONG
private handleSave() {
  this.uiState.state.data = this.localValue;  // Never!
}
```

**4. Clean Up Resources**

```typescript
@customElement('resource-view')
export class ResourceView extends LitElement {
  private subscription?: () => void;
  private interval?: number;
  
  connectedCallback() {
    super.connectedCallback();
    
    this.subscription = someService.subscribe(this.handleUpdate);
    this.interval = window.setInterval(this.poll, 1000);
  }
  
  disconnectedCallback() {
    if (this.subscription) {
      this.subscription();
      this.subscription = undefined;
    }
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
    
    super.disconnectedCallback();
  }
  
  private handleUpdate = () => {
    this.requestUpdate();
  };
  
  private poll = () => {
    // Polling logic
  };
}
```

---

## Handler Development

### Handler Pattern Reference

```typescript
type HandlerFunction = (
  state: UIState,
  action: HandlerAction
) => HandlerResult<UIState>;

interface HandlerResult<S> {
  state: S;              // New immutable state
  followUps: Action[];   // Subsequent actions
}
```

### Common Handler Patterns

#### 1. Simple State Update

```typescript
'feature/setValue': (state, action) => ({
  state: {
    ...state,
    feature: {
      ...state.feature,
      value: action.payload.value
    }
  },
  followUps: []
})
```

#### 2. Async Workflow Initiation

```typescript
'data/load': (state, action) => {
  // Trigger async operation (side effect)
  fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      const root = document.querySelector('framework-root');
      dispatchUiEvent(root!, 'data/loaded', { data });
    })
    .catch(error => {
      const root = document.querySelector('framework-root');
      dispatchUiEvent(root!, 'data/error', { error: error.message });
    });
  
  // Return immediate state with loading flag
  return {
    state: {
      ...state,
      data: {
        ...state.data,
        loading: true,
        error: null
      }
    },
    followUps: []
  };
}
```

#### 3. Multi-Step Orchestration

```typescript
'user/login': (state, action) => {
  const user = authenticateUser(action.payload);
  
  return {
    state: {
      ...state,
      auth: {
        user,
        isLoggedIn: true
      }
    },
    followUps: [
      { type: 'user/loadPreferences' },
      { type: 'user/loadNotifications' },
      { type: 'analytics/track', payload: { event: 'login', userId: user.id } },
      { type: 'notification/success', payload: { message: `Welcome, ${user.name}!` } }
    ]
  };
}
```

#### 4. Conditional Logic

```typescript
'feature/toggle': (state, action) => {
  const isEnabled = !state.feature.enabled;
  
  const followUps = [];
  
  if (isEnabled) {
    followUps.push(
      { type: 'feature/initialize' },
      { type: 'notification/info', payload: { message: 'Feature enabled' } }
    );
  } else {
    followUps.push(
      { type: 'feature/cleanup' },
      { type: 'notification/info', payload: { message: 'Feature disabled' } }
    );
  }
  
  return {
    state: {
      ...state,
      feature: {
        ...state.feature,
        enabled: isEnabled
      }
    },
    followUps
  };
}
```

#### 5. Validation and Error Handling

```typescript
'form/submit': (state, action) => {
  try {
    // Validate input
    const validated = validateFormData(action.payload);
    
    // Save data (sync or trigger async)
    saveFormData(validated);
    
    return {
      state: {
        ...state,
        form: {
          data: validated,
          dirty: false,
          errors: null
        }
      },
      followUps: [
        { type: 'notification/success', payload: { message: 'Form saved!' } },
        { type: 'navigation/back' }
      ]
    };
  } catch (error) {
    return {
      state: {
        ...state,
        form: {
          ...state.form,
          errors: error.errors || { _general: error.message }
        }
      },
      followUps: [
        { type: 'notification/error', payload: { message: 'Validation failed' } }
      ]
    };
  }
}
```

#### 6. State Aggregation

```typescript
'stats/calculate': (state, action) => {
  const data = state.data.items || [];
  
  const stats = {
    total: data.length,
    completed: data.filter(item => item.status === 'completed').length,
    pending: data.filter(item => item.status === 'pending').length,
    average: data.reduce((sum, item) => sum + item.value, 0) / data.length || 0
  };
  
  return {
    state: {
      ...state,
      stats
    },
    followUps: []
  };
}
```

---

## Component Development

### Component Types

The framework uses three types of components:

1. **Layout Components**: Structural components (panels, containers)
2. **Control Components**: Interactive widgets (buttons, inputs, expanders)
3. **View Components**: User-facing views registered with ViewRegistry

### Layout Component Example

```typescript
// File: src/components/layout/CustomPanel.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('custom-panel')
export class CustomPanel extends LitElement {
  @property({ type: String }) region = 'main';
  @property({ type: Boolean }) expanded = false;
  
  render() {
    return html`
      <div class="panel ${this.region} ${this.expanded ? 'expanded' : ''}">
        <div class="panel-header">
          <slot name="header"></slot>
        </div>
        <div class="panel-content">
          <slot></slot>
        </div>
      </div>
    `;
  }
  
  static styles = css`
    :host {
      display: block;
      contain: layout style paint;
    }
    
    .panel {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .panel-header {
      padding: 0.5rem;
      background: #f5f5f5;
      border-bottom: 1px solid #e5e5e5;
    }
    
    .panel-content {
      flex: 1;
      overflow: auto;
    }
  `;
}
```

### Control Component Example

```typescript
// File: src/components/controls/IconButton.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('icon-button')
export class IconButton extends LitElement {
  @property({ type: String }) icon = '';
  @property({ type: String }) label = '';
  @property({ type: Boolean }) disabled = false;
  @property({ type: String }) variant: 'default' | 'primary' | 'danger' = 'default';
  
  private handleClick(e: Event) {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    this.dispatchEvent(new CustomEvent('action', {
      bubbles: true,
      composed: true
    }));
  }
  
  render() {
    return html`
      <button 
        class="icon-button ${this.variant}"
        ?disabled=${this.disabled}
        @click=${this.handleClick}
        title=${this.label}
      >
        <span class="icon">${this.icon}</span>
        ${this.label ? html`<span class="label">${this.label}</span>` : ''}
      </button>
    `;
  }
  
  static styles = css`
    :host {
      display: inline-block;
    }
    
    .icon-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: 1px solid #ccc;
      border-radius: 0.25rem;
      background: white;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
    }
    
    .icon-button:hover:not(:disabled) {
      background: #f5f5f5;
      border-color: #999;
    }
    
    .icon-button:active:not(:disabled) {
      transform: translateY(1px);
    }
    
    .icon-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .icon-button.primary {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }
    
    .icon-button.primary:hover:not(:disabled) {
      background: #2563eb;
    }
    
    .icon-button.danger {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
    }
    
    .icon-button.danger:hover:not(:disabled) {
      background: #dc2626;
    }
  `;
}
```

### Component Composition

```typescript
// Base component
@customElement('base-panel')
export class BasePanel extends LitElement {
  @property({ type: String }) title = '';
  @property({ type: Boolean }) collapsible = false;
  @state() private collapsed = false;
  
  protected getClasses() {
    return {
      'panel': true,
      'panel--collapsed': this.collapsed
    };
  }
  
  protected toggleCollapsed() {
    if (this.collapsible) {
      this.collapsed = !this.collapsed;
    }
  }
  
  render() {
    return html`
      <div class=${classMap(this.getClasses())}>
        ${this.renderHeader()}
        ${this.renderContent()}
      </div>
    `;
  }
  
  protected renderHeader() {
    return html`
      <div class="panel__header" @click=${this.toggleCollapsed}>
        <span class="panel__title">${this.title}</span>
        ${this.collapsible ? html`
          <span class="panel__toggle">
            ${this.collapsed ? '▶' : '▼'}
          </span>
        ` : ''}
      </div>
    `;
  }
  
  protected renderContent() {
    if (this.collapsed) return '';
    return html`
      <div class="panel__content">
        <slot></slot>
      </div>
    `;
  }
}

// Extended component
@customElement('data-panel')
export class DataPanel extends BasePanel {
  @consume({ context: uiStateContext, subscribe: true })
  uiState?: UiStateContextValue;
  
  protected override renderContent() {
    if (this.collapsed) return '';
    
    const data = this.uiState?.state.data?.items ?? [];
    
    return html`
      <div class="panel__content">
        ${data.length > 0 ? html`
          <ul>
            ${data.map(item => html`
              <li>${item.name}</li>
            `)}
          </ul>
        ` : html`
          <p>No data</p>
        `}
      </div>
    `;
  }
}
```

---

## State Extension

### Adding Custom Application State

```typescript
// 1. Define your state shape
// File: src/types/app-state.ts
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface AppState {
  todos: {
    items: TodoItem[];
    filter: 'all' | 'active' | 'completed';
  };
  user: {
    name: string;
    preferences: Record<string, any>;
  };
}

// 2. Extend UIState
// File: src/types/ui-state.ts
import type { AppState } from './app-state';

export type UIState = {
  // Framework state
  panels: Panel[];
  views: View[];
  layout: LayoutState;
  // ... other framework state
  
  // Application state
  app: AppState;
};

// 3. Create selectors
// File: src/state/app-selectors.ts
export const getTodos = (state: UIState) => 
  state.app?.todos.items ?? [];

export const getActiveTodos = (state: UIState) =>
  getTodos(state).filter(t => !t.completed);

export const getCompletedTodos = (state: UIState) =>
  getTodos(state).filter(t => t.completed);

export const getTodoFilter = (state: UIState) =>
  state.app?.todos.filter ?? 'all';

export const getFilteredTodos = (state: UIState) => {
  const todos = getTodos(state);
  const filter = getTodoFilter(state);
  
  switch (filter) {
    case 'active': return getActiveTodos(state);
    case 'completed': return getCompletedTodos(state);
    default: return todos;
  }
};

// 4. Create handlers
// File: src/handlers/app/todos.handlers.ts
export const todosHandlers = {
  'todos/add': (state: UIState, action: HandlerAction) => ({
    state: {
      ...state,
      app: {
        ...state.app,
        todos: {
          ...state.app.todos,
          items: [
            ...state.app.todos.items,
            {
              id: `todo-${Date.now()}`,
              text: action.payload.text,
              completed: false,
              createdAt: Date.now()
            }
          ]
        }
      }
    },
    followUps: []
  }),
  
  'todos/toggle': (state, action) => ({
    state: {
      ...state,
      app: {
        ...state.app,
        todos: {
          ...state.app.todos,
          items: state.app.todos.items.map(todo =>
            todo.id === action.payload.id
              ? { ...todo, completed: !todo.completed }
              : todo
          )
        }
      }
    },
    followUps: []
  }),
  
  'todos/remove': (state, action) => ({
    state: {
      ...state,
      app: {
        ...state.app,
        todos: {
          ...state.app.todos,
          items: state.app.todos.items.filter(
            todo => todo.id !== action.payload.id
          )
        }
      }
    },
    followUps: []
  }),
  
  'todos/setFilter': (state, action) => ({
    state: {
      ...state,
      app: {
        ...state.app,
        todos: {
          ...state.app.todos,
          filter: action.payload.filter
        }
      }
    },
    followUps: []
  })
};

// 5. Register handlers
// File: src/handlers/handler-registry.ts
import { todosHandlers } from './app/todos.handlers';

export const coreHandlers = {
  ...frameworkHandlers,
  ...todosHandlers
};

// 6. Use in components
// File: src/views/TodosView.ts
@customElement('todos-view')
export class TodosView extends LitElement {
  @consume({ context: uiStateContext, subscribe: true })
  uiState?: UiStateContextValue;
  
  @state() private newTodoText = '';
  
  private handleAdd() {
    if (!this.newTodoText.trim()) return;
    
    dispatchUiEvent(this, 'todos/add', {
      text: this.newTodoText
    });
    
    this.newTodoText = '';
  }
  
  private handleToggle(id: string) {
    dispatchUiEvent(this, 'todos/toggle', { id });
  }
  
  private handleRemove(id: string) {
    dispatchUiEvent(this, 'todos/remove', { id });
  }
  
  private handleFilterChange(filter: 'all' | 'active' | 'completed') {
    dispatchUiEvent(this, 'todos/setFilter', { filter });
  }
  
  render() {
    const todos = getFilteredTodos(this.uiState?.state ?? {} as UIState);
    const filter = getTodoFilter(this.uiState?.state ?? {} as UIState);
    
    return html`
      <div class="todos-view">
        <div class="input-section">
          <input 
            .value=${this.newTodoText}
            @input=${(e: Event) => {
              this.newTodoText = (e.target as HTMLInputElement).value;
            }}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === 'Enter') this.handleAdd();
            }}
            placeholder="What needs to be done?"
          />
          <button @click=${this.handleAdd}>Add</button>
        </div>
        
        <div class="filter-section">
          <button 
            class=${filter === 'all' ? 'active' : ''}
            @click=${() => this.handleFilterChange('all')}
          >
            All
          </button>
          <button 
            class=${filter === 'active' ? 'active' : ''}
            @click=${() => this.handleFilterChange('active')}
          >
            Active
          </button>
          <button 
            class=${filter === 'completed' ? 'active' : ''}
            @click=${() => this.handleFilterChange('completed')}
          >
            Completed
          </button>
        </div>
        
        <ul class="todo-list">
          ${todos.map(todo => html`
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
              <input 
                type="checkbox"
                .checked=${todo.completed}
                @change=${() => this.handleToggle(todo.id)}
              />
              <span>${todo.text}</span>
              <button @click=${() => this.handleRemove(todo.id)}>×</button>
            </li>
          `)}
        </ul>
      </div>
    `;
  }
}
```

---

## Performance Optimization

### 1. Memoized Computed Values

```typescript
@customElement('optimized-view')
export class OptimizedView extends LitElement {
  @consume({ context: uiStateContext, subscribe: true })
  uiState?: UiStateContextValue;
  
  private computedValue: any = null;
  private computedDeps: any[] = [];
  
  private getComputed() {
    const deps = [
      this.uiState?.state.auth,
      this.uiState?.state.data
    ];
    
    // Only recompute if dependencies changed
    if (JSON.stringify(deps) !== JSON.stringify(this.computedDeps)) {
      this.computedValue = expensiveComputation(deps);
      this.computedDeps = deps;
    }
    
    return this.computedValue;
  }
  
  render() {
    const computed = this.getComputed();
    return html`<div>${computed}</div>`;
  }
}
```

### 2. Debounced Updates

```typescript
@customElement('debounced-view')
export class DebouncedView extends LitElement {
  @state() private searchQuery = '';
  private updateTimeout?: number;
  
  private scheduleSearch(query: string) {
    clearTimeout(this.updateTimeout);
    
    this.updateTimeout = window.setTimeout(() => {
      dispatchUiEvent(this, 'search/query', { query });
    }, 300);
  }
  
  private handleInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.searchQuery = value;
    this.scheduleSearch(value);
  }
  
  render() {
    return html`
      <input 
        .value=${this.searchQuery}
        @input=${this.handleInput}
        placeholder="Search..."
      />
    `;
  }
}
```

### 3. Virtual Scrolling

```typescript
import { virtualize } from '@lit-labs/virtualizer';

@customElement('large-list-view')
export class LargeListView extends LitElement {
  @consume({ context: uiStateContext, subscribe: true })
  uiState?: UiStateContextValue;
  
  render() {
    const items = this.uiState?.state.data?.items ?? [];
    
    return html`
      <div class="list-container">
        ${virtualize({
          items,
          renderItem: (item) => html`
            <list-item .item=${item}></list-item>
          `
        })}
      </div>
    `;
  }
}
```

### 4. Lazy Rendering

```typescript
@customElement('lazy-view')
export class LazyView extends LitElement {
  @consume({ context: uiStateContext, subscribe: true })
  uiState?: UiStateContextValue;
  
  @state() private activeTab = 0;
  
  render() {
    return html`
      <div class="tabs">
        ${this.renderTabs()}
      </div>
      <div class="tab-content">
        ${this.renderActiveTabContent()}
      </div>
    `;
  }
  
  private renderTabs() {
    return html`
      <button @click=${() => this.activeTab = 0}>Tab 1</button>
      <button @click=${() => this.activeTab = 1}>Tab 2</button>
      <button @click=${() => this.activeTab = 2}>Tab 3</button>
    `;
  }
  
  private renderActiveTabContent() {
    // Only render active tab content
    switch (this.activeTab) {
      case 0: return this.renderTab1();
      case 1: return this.renderTab2();
      case 2: return this.renderTab3();
      default: return '';
    }
  }
  
  private renderTab1() {
    return html`<tab-1-content></tab-1-content>`;
  }
  
  private renderTab2() {
    return html`<tab-2-content></tab-2-content>`;
  }
  
  private renderTab3() {
    return html`<tab-3-content></tab-3-content>`;
  }
}
```

### 5. Efficient State Selectors

```typescript
// ✅ EFFICIENT: Create selector functions
export const getVisibleTodos = (state: UIState) => {
  const filter = state.app.todos.filter;
  const todos = state.app.todos.items;
  
  return todos.filter(todo => {
    switch (filter) {
      case 'active': return !todo.completed;
      case 'completed': return todo.completed;
      default: return true;
    }
  });
};

// Use in component
render() {
  const visible = getVisibleTodos(this.uiState?.state ?? {} as UIState);
  return html`...`;
}

// ❌ INEFFICIENT: Filtering in render
render() {
  const todos = this.uiState?.state.app.todos.items ?? [];
  const filter = this.uiState?.state.app.todos.filter;
  const visible = todos.filter(t => {
    // Complex filtering logic repeated on every render
  });
  return html`...`;
}
```

---

## Plugin Architecture

### Plugin Interface

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
```

### Plugin Manager

```typescript
export class PluginManager {
  private plugins = new Map<string, FrameworkPlugin>();
  private frameworkRoot: Element | null = null;
  
  setFrameworkRoot(root: Element) {
    this.frameworkRoot = root;
  }
  
  install(plugin: FrameworkPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} already installed`);
    }
    
    const context = this.createContext();
    plugin.install(context);
    this.plugins.set(plugin.id, plugin);
    
    console.log(`Plugin "${plugin.name}" installed`);
  }
  
  uninstall(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }
    
    if (plugin.uninstall) {
      plugin.uninstall();
    }
    
    this.plugins.delete(pluginId);
    console.log(`Plugin "${plugin.name}" uninstalled`);
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
        // Implementation depends on middleware system
      },
      
      getState: () => {
        return (this.frameworkRoot as any)?.state ?? {};
      },
      
      dispatch: (type, payload) => {
        if (this.frameworkRoot) {
          dispatchUiEvent(this.frameworkRoot, type, payload);
        }
      }
    };
  }
}

export const pluginManager = new PluginManager();
```

### Example Plugin

```typescript
// File: plugins/analytics-plugin.ts
import type { FrameworkPlugin, PluginContext } from '@project/framework';

export const analyticsPlugin: FrameworkPlugin = {
  id: 'analytics',
  name: 'Analytics Plugin',
  version: '1.0.0',
  
  install(context: PluginContext) {
    // Track all actions
    const originalDispatch = context.dispatch;
    context.dispatch = (type, payload) => {
      // Track action
      console.log('Analytics:', type, payload);
      
      // Forward to original dispatch
      originalDispatch(type, payload);
    };
    
    // Add analytics handlers
    context.registerHandler('analytics/track', (state, action) => {
      // Send to analytics service
      sendToAnalytics(action.payload);
      
      return { state, followUps: [] };
    });
    
    // Add analytics view
    context.registerView({
      id: 'analytics-dashboard',
      name: 'Analytics',
      title: 'Analytics Dashboard',
      tag: 'analytics-dashboard',
      icon: '📊',
      component: () => import('./analytics-dashboard')
    });
  },
  
  uninstall() {
    console.log('Analytics plugin uninstalled');
  }
};

// Usage
import { pluginManager } from '@project/framework';
import { analyticsPlugin } from './plugins/analytics-plugin';

pluginManager.install(analyticsPlugin);
```

---

## Middleware System

### Middleware Interface

```typescript
// File: src/handlers/middleware.ts
type Middleware = (
  state: UIState,
  action: HandlerAction,
  next: (state: UIState, action: HandlerAction) => HandlerResult<UIState>
) => HandlerResult<UIState>;
```

### Common Middlewares

#### Logging Middleware

```typescript
const loggingMiddleware: Middleware = (state, action, next) => {
  console.group(`Action: ${action.type}`);
  console.log('Payload:', action.payload);
  console.log('State before:', state);
  
  const result = next(state, action);
  
  console.log('State after:', result.state);
  console.log('Follow-ups:', result.followUps);
  console.groupEnd();
  
  return result;
};
```

#### Performance Middleware

```typescript
const performanceMiddleware: Middleware = (state, action, next) => {
  const start = performance.now();
  
  const result = next(state, action);
  
  const duration = performance.now() - start;
  
  if (duration > 16) { // More than one frame
    console.warn(`Slow handler: ${action.type} took ${duration.toFixed(2)}ms`);
  }
  
  return result;
};
```

#### Validation Middleware

```typescript
const validationMiddleware: Middleware = (state, action, next) => {
  // Validate action structure
  if (!action.type) {
    console.error('Invalid action: missing type', action);
    return { state, followUps: [] };
  }
  
  // Validate handler exists
  if (!frameworkHandlers.has(action.type)) {
    console.warn(`No handler for action: ${action.type}`);
    return { state, followUps: [] };
  }
  
  return next(state, action);
};
```

### Applying Middleware

```typescript
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

// Usage
const handlerWithMiddleware = applyMiddleware(
  myHandler,
  [loggingMiddleware, performanceMiddleware, validationMiddleware]
);
```

---

## Custom Event Bus

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
    
    // Return unsubscribe function
    return () => this.off(event, handler);
  }
  
  off(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }
  
  emit(event: string, detail?: any): void {
    this.handlers.get(event)?.forEach(handler => handler(detail));
  }
  
  once(event: string, handler: EventHandler): void {
    const wrappedHandler = (detail: any) => {
      handler(detail);
      this.off(event, wrappedHandler);
    };
    this.on(event, wrappedHandler);
  }
  
  clear(): void {
    this.handlers.clear();
  }
}

export const eventBus = new EventBus();

// Usage
eventBus.on('user:login', (user) => {
  console.log('User logged in:', user);
});

eventBus.emit('user:login', { id: '123', name: 'John' });
```

---

## Testing Strategy

### Testing Pyramid

```
        /\
       /  \  E2E Tests (Few)
      /----\
     /      \  Integration Tests (Some)
    /--------\
   /          \ Unit Tests (Many)
  /____________\
```

### Test File Organization

```
src/
├── handlers/
│   ├── todos/
│   │   ├── todos.handlers.ts
│   │   └── __tests__/
│   │       └── todos.handlers.test.ts
├── components/
│   ├── TodoView.ts
│   └── __tests__/
│       └── TodoView.test.ts
└── state/
    ├── selectors.ts
    └── __tests__/
        └── selectors.test.ts
```

---

## Unit Testing Handlers

```typescript
// File: src/handlers/todos/__tests__/todos.handlers.test.ts
import { describe, it, expect } from 'vitest';
import { todosHandlers } from '../todos.handlers';
import type { UIState } from '../../../types/ui-state';

describe('todos handlers', () => {
  const createMockState = (): UIState => ({
    panels: [],
    views: [],
    containers: [],
    activeView: null,
    viewTokens: {
      registered: [],
      activeSlots: [null, null, null, null, null],
      tokenOrder: []
    },
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
    app: {
      todos: {
        items: [],
        filter: 'all'
      },
      user: {
        name: '',
        preferences: {}
      }
    }
  });
  
  describe('todos/add', () => {
    it('adds a new todo', () => {
      const state = createMockState();
      const result = todosHandlers['todos/add'](state, {
        type: 'todos/add',
        payload: { text: 'Buy milk' }
      });
      
      expect(result.state.app.todos.items).toHaveLength(1);
      expect(result.state.app.todos.items[0].text).toBe('Buy milk');
      expect(result.state.app.todos.items[0].completed).toBe(false);
      expect(result.followUps).toEqual([]);
    });
    
    it('does not mutate original state', () => {
      const state = createMockState();
      const originalItems = state.app.todos.items;
      
      const result = todosHandlers['todos/add'](state, {
        type: 'todos/add',
        payload: { text: 'Test' }
      });
      
      expect(result.state).not.toBe(state);
      expect(result.state.app.todos.items).not.toBe(originalItems);
      expect(state.app.todos.items).toHaveLength(0); // Original unchanged
    });
  });
  
  describe('todos/toggle', () => {
    it('toggles todo completion status', () => {
      const state = createMockState();
      state.app.todos.items = [{
        id: 'todo-1',
        text: 'Test',
        completed: false,
        createdAt: Date.now()
      }];
      
      const result = todosHandlers['todos/toggle'](state, {
        type: 'todos/toggle',
        payload: { id: 'todo-1' }
      });
      
      expect(result.state.app.todos.items[0].completed).toBe(true);
    });
    
    it('does not affect other todos', () => {
      const state = createMockState();
      state.app.todos.items = [
        { id: 'todo-1', text: 'First', completed: false, createdAt: Date.now() },
        { id: 'todo-2', text: 'Second', completed: false, createdAt: Date.now() }
      ];
      
      const result = todosHandlers['todos/toggle'](state, {
        type: 'todos/toggle',
        payload: { id: 'todo-1' }
      });
      
      expect(result.state.app.todos.items[0].completed).toBe(true);
      expect(result.state.app.todos.items[1].completed).toBe(false);
    });
  });
  
  describe('todos/remove', () => {
    it('removes todo by id', () => {
      const state = createMockState();
      state.app.todos.items = [
        { id: 'todo-1', text: 'First', completed: false, createdAt: Date.now() },
        { id: 'todo-2', text: 'Second', completed: false, createdAt: Date.now() }
      ];
      
      const result = todosHandlers['todos/remove'](state, {
        type: 'todos/remove',
        payload: { id: 'todo-1' }
      });
      
      expect(result.state.app.todos.items).toHaveLength(1);
      expect(result.state.app.todos.items[0].id).toBe('todo-2');
    });
  });
  
  describe('todos/setFilter', () => {
    it('updates filter', () => {
      const state = createMockState();
      
      const result = todosHandlers['todos/setFilter'](state, {
        type: 'todos/setFilter',
        payload: { filter: 'completed' }
      });
      
      expect(result.state.app.todos.filter).toBe('completed');
    });
  });
});
```

---

## Integration Testing Components

```typescript
// File: src/components/__tests__/TodoView.test.ts
import { fixture, html, expect } from '@open-wc/testing';
import { TodoView } from '../TodoView';
import type { UiStateContextValue } from '../../state/ui-state';

describe('TodoView', () => {
  const createMockContext = (): UiStateContextValue => ({
    state: {
      app: {
        todos: {
          items: [
            { id: '1', text: 'Test todo', completed: false, createdAt: Date.now() }
          ],
          filter: 'all'
        }
      }
    } as any,
    dispatch: () => {}
  });
  
  it('renders todos from state', async () => {
    const el = await fixture<TodoView>(html`
      <todos-view></todos-view>
    `);
    
    // Provide mock context
    el.uiState = createMockContext();
    await el.updateComplete;
    
    const todoItems = el.shadowRoot?.querySelectorAll('.todo-item');
    expect(todoItems).to.have.length(1);
    expect(todoItems?.[0].textContent).to.include('Test todo');
  });
  
  it('dispatches add action on button click', async () => {
    const el = await fixture<TodoView>(html`
      <todos-view></todos-view>
    `);
    
    let dispatchedAction: any = null;
    el.uiState = {
      ...createMockContext(),
      dispatch: (action) => { dispatchedAction = action; }
    } as any;
    await el.updateComplete;
    
    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    
    input.value = 'New todo';
    input.dispatchEvent(new Event('input'));
    button.click();
    
    expect(dispatchedAction).to.exist;
    expect(dispatchedAction.type).to.equal('todos/add');
    expect(dispatchedAction.payload.text).to.equal('New todo');
  });
});
```

---

## End-to-End Testing

```typescript
// File: e2e/todos.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Todos Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });
  
  test('can add a todo', async ({ page }) => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    const addButton = page.locator('button:has-text("Add")');
    
    await input.fill('Buy groceries');
    await addButton.click();
    
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-item')).toContainText('Buy groceries');
  });
  
  test('can toggle todo completion', async ({ page }) => {
    // Add a todo first
    await page.locator('input[placeholder="What needs to be done?"]').fill('Test todo');
    await page.locator('button:has-text("Add")').click();
    
    // Toggle completion
    const checkbox = page.locator('.todo-item input[type="checkbox"]');
    await checkbox.check();
    
    await expect(page.locator('.todo-item')).toHaveClass(/completed/);
  });
  
  test('can filter todos', async ({ page }) => {
    // Add completed and active todos
    const input = page.locator('input[placeholder="What needs to be done?"]');
    await input.fill('Active todo');
    await page.locator('button:has-text("Add")').click();
    
    await input.fill('Completed todo');
    await page.locator('button:has-text("Add")').click();
    await page.locator('.todo-item:last-child input[type="checkbox"]').check();
    
    // Filter active
    await page.locator('button:has-text("Active")').click();
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-item')).toContainText('Active todo');
    
    // Filter completed
    await page.locator('button:has-text("Completed")').click();
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-item')).toContainText('Completed todo');
  });
});
```

---

## Code Patterns

### 1. Immutable Updates

```typescript
// ✅ CORRECT
const newState = {
  ...state,
  nested: {
    ...state.nested,
    value: newValue
  }
};

// ❌ WRONG
state.nested.value = newValue;
```

### 2. Pure Functions

```typescript
// ✅ CORRECT
const handler = (state, action) => {
  const result = pureCalculation(action.payload);
  return {
    state: { ...state, result },
    followUps: []
  };
};

// ❌ WRONG
const handler = (state, action) => {
  localStorage.setItem('key', action.payload); // Side effect!
  return { state, followUps: [] };
};
```

### 3. Type-Safe Actions

```typescript
// ✅ CORRECT
interface TodoAddAction {
  type: 'todos/add';
  payload: {
    text: string;
  };
}

const handler: ReducerHandler<UIState> = (state, action: TodoAddAction) => {
  // TypeScript ensures payload has text property
  return {
    state: {
      ...state,
      todos: [...state.todos, { text: action.payload.text }]
    },
    followUps: []
  };
};
```

---

## Error Handling

### Handler Error Handling

```typescript
'data/save': (state, action) => {
  try {
    const validated = validateData(action.payload);
    saveData(validated);
    
    return {
      state: {
        ...state,
        data: validated,
        error: null
      },
      followUps: [
        { type: 'notification/success', payload: { message: 'Saved!' } }
      ]
    };
  } catch (error) {
    console.error('Save failed:', error);
    
    return {
      state: {
        ...state,
        error: error.message
      },
      followUps: [
        { type: 'notification/error', payload: { message: error.message } }
      ]
    };
  }
}
```

### Component Error Handling

```typescript
@customElement('safe-view')
export class SafeView extends LitElement {
  @consume({ context: uiStateContext, subscribe: true })
  uiState?: UiStateContextValue;
  
  @state() private error: string | null = null;
  
  private handleAction() {
    try {
      const data = this.prepareData();
      dispatchUiEvent(this, 'data/save', { data });
    } catch (error) {
      this.error = error.message;
      console.error('Action failed:', error);
    }
  }
  
  private prepareData() {
    // May throw
    return complexDataPreparation();
  }
  
  render() {
    if (this.error) {
      return html`
        <div class="error">
          <h3>Error</h3>
          <p>${this.error}</p>
          <button @click=${() => this.error = null}>Dismiss</button>
        </div>
      `;
    }
    
    return html`<!-- normal view -->`;
  }
}
```

---

## Debugging Techniques

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

### 2. Inspect State in Console

```typescript
// In browser console
__frameworkRoot.state
__frameworkRoot.state.layout
__frameworkRoot.state.panels
```

### 3. Monitor Actions

```typescript
window.addEventListener('ui-event', (event) => {
  console.log('Action:', event.detail);
});
```

### 4. State Snapshots

```typescript
const takeSnapshot = () => {
  const root = document.querySelector('framework-root') as any;
  return JSON.parse(JSON.stringify(root.state));
};

// Take snapshot before action
const before = takeSnapshot();

// Perform action
dispatchUiEvent(root, 'some/action', payload);

// Take snapshot after action
const after = takeSnapshot();

// Compare
console.log('State diff:', diff(before, after));
```

### 5. Action History

```typescript
const actionHistory: any[] = [];

window.addEventListener('ui-event', (event) => {
  actionHistory.push({
    type: event.detail.type,
    payload: event.detail.payload,
    timestamp: Date.now()
  });
});

// View history
console.table(actionHistory);
```

---

## Common Pitfalls

### ❌ Pitfall 1: Mutating State

```typescript
// WRONG
'todos/toggle': (state, action) => {
  const todo = state.todos.find(t => t.id === action.payload.id);
  todo.completed = !todo.completed;  // Mutation!
  return { state, followUps: [] };
}

// CORRECT
'todos/toggle': (state, action) => ({
  state: {
    ...state,
    todos: state.todos.map(t =>
      t.id === action.payload.id
        ? { ...t, completed: !t.completed }
        : t
    )
  },
  followUps: []
})
```

### ❌ Pitfall 2: Side Effects in Handlers

```typescript
// WRONG
'user/login': (state, action) => {
  localStorage.setItem('user', JSON.stringify(action.payload));  // Side effect!
  return {
    state: { ...state, user: action.payload },
    followUps: []
  };
}

// CORRECT
'user/login': (state, action) => ({
  state: { ...state, user: action.payload },
  followUps: [
    { type: 'storage/persist', payload: { key: 'user', value: action.payload } }
  ]
})
```

### ❌ Pitfall 3: Async Handlers

```typescript
// WRONG
'data/load': async (state, action) => {
  const data = await fetch('/api/data').then(r => r.json());
  return { state: { ...state, data }, followUps: [] };
}

// CORRECT
'data/load': (state, action) => {
  fetch('/api/data')
    .then(r => r.json())
    .then(data => {
      const root = document.querySelector('framework-root');
      dispatchUiEvent(root!, 'data/loaded', { data });
    });
  
  return {
    state: { ...state, loading: true },
    followUps: []
  };
}
```

### ❌ Pitfall 4: Not Returning New State

```typescript
// WRONG
'todos/add': (state, action) => {
  state.todos.items.push(action.payload);  // Mutation
  return { state, followUps: [] };  // Same object reference
}

// CORRECT
'todos/add': (state, action) => ({
  state: {
    ...state,
    todos: {
      ...state.todos,
      items: [...state.todos.items, action.payload]
    }
  },
  followUps: []
})
```

---

## Version Management

### Semantic Versioning

Follow [SemVer](https://semver.org/):

- **MAJOR**: Breaking changes (2.0.0)
- **MINOR**: New features, backward compatible (1.1.0)
- **PATCH**: Bug fixes (1.0.1)

### Version Scripts

```json
{
  "scripts": {
    "version:patch": "npm version patch",
    "version:minor": "npm version minor",
    "version:major": "npm version major"
  }
}
```

---

## Release Process

### Release Checklist

- [ ] All tests passing (`npm test`)
- [ ] Update CHANGELOG.md with changes
- [ ] Update version in package.json
- [ ] Build distribution files (`npm run build`)
- [ ] Commit all changes
- [ ] Create git tag (`git tag v1.2.3`)
- [ ] Push commits and tags (`git push && git push --tags`)
- [ ] Publish to npm (`npm publish`)
- [ ] Update documentation site
- [ ] Create GitHub release with notes

### Changelog Template

```markdown
# Changelog

## [1.2.0] - 2024-01-15

### Added
- New notification system with auto-dismiss
- Plugin architecture for extensibility
- Performance middleware

### Changed
- Improved handler error handling
- Updated dependencies

### Fixed
- State hydration bug on initial load
- Memory leak in view cleanup

### Deprecated
- `oldApiMethod()` - use `newApiMethod()` instead

## [1.1.0] - 2024-01-01
...
```

---

## Breaking Changes

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

**Automated Migration**:
```bash
npm run migrate:v2
```
```

---

## Summary

### Framework Extension Checklist

When adding features to the framework:

- [ ] **Types First**: Define types in `/src/types/`
- [ ] **State Schema**: Update `UIState` interface
- [ ] **Handlers**: Create pure handler functions
- [ ] **Registration**: Register handlers in handler registry
- [ ] **Selectors**: Add selectors to `/src/state/selectors.ts`
- [ ] **Components**: Build UI components if needed
- [ ] **Tests**: Write comprehensive unit/integration tests
- [ ] **Documentation**: Update docs and examples
- [ ] **Public API**: Export from `/src/index.ts`

### Key Principles

1. ✅ **Type Safety**: TypeScript throughout with strict typing
2. ✅ **Immutability**: Never mutate state—always return new objects
3. ✅ **Pure Functions**: No side effects in handlers
4. ✅ **Separation of Concerns**: Views present, handlers transform
5. ✅ **Testability**: Unit test handlers, integrate test components
6. ✅ **Documentation**: Clear, comprehensive docs with examples

### Compliance Criteria

Use this checklist when reviewing framework changes:

- [ ] **Pure Handlers Only**: No I/O, async work, timers, storage, or network calls inside reducers/handlers; return new state + follow-ups only.
- [ ] **Unidirectional Flow**: Views dispatch actions; context is read-only; handlers transform state.
- [ ] **Immutable Updates**: No in-place mutation of state or nested objects/arrays.
- [ ] **Side Effects Routed**: Logging, persistence, auth, and external calls must be via follow-ups or dedicated effect/middleware paths.
- [ ] **Type-Safe Actions**: Action payloads are typed and validated/normalized before use.
- [ ] **Layer Boundaries**: Views in component layer; state/registry in core; no cross-layer coupling.

---

## Resources

### Framework Source

- **Framework Root**: `/packages/framework/src/`
- **Type Definitions**: `/packages/framework/src/types/`
- **Handler Registry**: `/packages/framework/src/handlers/handler-registry.ts`
- **View Registry**: `/packages/framework/src/registry/ViewRegistry.ts`
- **State Management**: `/packages/framework/src/state/`
- **Components**: `/packages/framework/src/components/`
- **Utilities**: `/packages/framework/src/utils/`

### Test Examples

- **Handler Tests**: `/packages/framework/src/handlers/**/__tests__/`
- **Component Tests**: `/packages/framework/src/components/**/__tests__/`
- **E2E Tests**: `/packages/playground/e2e/`

### External Documentation

- [Lit Element](https://lit.dev/)
- [Lit Context](https://lit.dev/docs/data/context/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

---

**BuildBlox Framework Development**  
*Extensible • Type-Safe • Well-Tested*

Version: 1.0.0  
Last Updated: January 2026
