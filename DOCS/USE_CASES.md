# BuildBlox Framework - Use Case Examples

## Table of Contents

1. [Selection & Focus Management](#selection--focus-management)
2. [Multi-Panel Coordination](#multi-panel-coordination)
3. [Undo/Redo System](#undoredo-system)
4. [Drag & Drop Between Panels](#drag--drop-between-panels)
5. [Real-time Collaboration](#real-time-collaboration)
6. [Plugin System](#plugin-system)
7. [Custom Toolbars](#custom-toolbars)
8. [State Persistence](#state-persistence)

---

## Selection & Focus Management

### Use Case
User selects an item in one panel, and other panels update to show related information.

### Implementation

**1. Selection State in Context**
```typescript
// Add to UIState type
interface UIState {
  // ... existing properties
  app: {
    selection: {
      itemId: string | null;
      itemType: 'block' | 'component' | 'asset' | null;
      timestamp: number;
    } | null;
  };
}
```

**2. Register Selection Handler**
```typescript
import { frameworkHandlers } from '@project/framework';

frameworkHandlers.register('app/setSelection', (state, action) => {
  const { itemId, itemType } = action.payload ?? {};
  
  return {
    state: {
      ...state,
      app: {
        ...state.app,
        selection: itemId ? {
          itemId,
          itemType: itemType ?? 'block',
          timestamp: Date.now()
        } : null
      }
    },
    followUps: [
      // Fetch details for selected item
      { type: 'app/fetchSelectionDetails', payload: { itemId } }
    ]
  };
});
```

**3. Canvas View (Selection Producer)**
```typescript
@customElement('canvas-editor')
export class CanvasEditor extends LitElement {
  private handleItemClick(itemId: string, itemType: string) {
    // Dispatch selection change
    dispatchUiEvent(this, 'app/setSelection', {
      itemId,
      itemType
    });
  }
  
  render() {
    const selection = (this.uiState?.app as any)?.selection;
    
    return html`
      <canvas-surface>
        ${this.items.map(item => html`
          <canvas-item
            .item=${item}
            .selected=${item.id === selection?.itemId}
            @click=${() => this.handleItemClick(item.id, 'block')}
          ></canvas-item>
        `)}
      </canvas-surface>
    `;
  }
}
```

**4. Properties Panel (Selection Consumer)**
```typescript
@customElement('properties-panel')
export class PropertiesPanel extends LitElement {
  render() {
    const selection = (this.uiState?.app as any)?.selection;
    
    if (!selection) {
      return html`<div class="empty">No selection</div>`;
    }
    
    return html`
      <div class="properties">
        <h3>Properties: ${selection.itemType}</h3>
        <property-editor .itemId=${selection.itemId}></property-editor>
      </div>
    `;
  }
}
```

---

## Multi-Panel Coordination

### Use Case
Coordinate state across multiple panels (e.g., code editor, preview, and inspector).

### Implementation

**1. Shared Document State**
```typescript
frameworkHandlers.register('app/updateDocument', (state, action) => {
  const { content, source } = action.payload ?? {};
  
  return {
    state: {
      ...state,
      app: {
        ...state.app,
        document: {
          content,
          lastModified: Date.now(),
          modifiedBy: source
        }
      }
    },
    followUps: [
      { type: 'app/rebuildPreview', payload: { content } }
    ]
  };
});
```

**2. Code Editor (Producer)**
```typescript
@customElement('code-editor')
export class CodeEditor extends LitElement {
  private debounceTimeout?: number;
  
  private handleCodeChange(content: string) {
    clearTimeout(this.debounceTimeout);
    
    this.debounceTimeout = window.setTimeout(() => {
      dispatchUiEvent(this, 'app/updateDocument', {
        content,
        source: 'code-editor'
      });
    }, 300);
  }
  
  render() {
    const doc = (this.uiState?.app as any)?.document;
    
    return html`
      <textarea
        .value=${doc?.content ?? ''}
        @input=${(e: Event) => this.handleCodeChange((e.target as HTMLTextAreaElement).value)}
      ></textarea>
    `;
  }
}
```

**3. Preview Panel (Consumer)**
```typescript
@customElement('preview-panel')
export class PreviewPanel extends LitElement {
  @state() private renderedContent = '';
  
  updated(changed: PropertyMap) {
    if (changed.has('uiState')) {
      const doc = (this.uiState?.app as any)?.document;
      if (doc && doc.modifiedBy !== 'preview') {
        this.renderedContent = this.renderContent(doc.content);
      }
    }
  }
  
  private renderContent(content: string): string {
    // Transform content for preview
    return content;
  }
  
  render() {
    return html`
      <div class="preview" .innerHTML=${this.renderedContent}></div>
    `;
  }
}
```

---

## Undo/Redo System

### Use Case
Implement undo/redo functionality that works across all panels.

### Implementation

**1. History State**
```typescript
interface HistoryState {
  past: UIState[];
  present: UIState;
  future: UIState[];
}
```

**2. History Handlers**
```typescript
frameworkHandlers.register('history/undo', (state, action) => {
  const history = (state as any).history as HistoryState;
  
  if (!history || history.past.length === 0) {
    return { state, followUps: [] };
  }
  
  const previous = history.past[history.past.length - 1];
  const newPast = history.past.slice(0, -1);
  
  return {
    state: {
      ...previous,
      history: {
        past: newPast,
        present: previous,
        future: [history.present, ...history.future]
      }
    },
    followUps: []
  };
});

frameworkHandlers.register('history/redo', (state, action) => {
  const history = (state as any).history as HistoryState;
  
  if (!history || history.future.length === 0) {
    return { state, followUps: [] };
  }
  
  const next = history.future[0];
  const newFuture = history.future.slice(1);
  
  return {
    state: {
      ...next,
      history: {
        past: [...history.past, history.present],
        present: next,
        future: newFuture
      }
    },
    followUps: []
  };
});
```

**3. Trackable Actions**
```typescript
// Wrap actions that should be tracked
frameworkHandlers.register('app/updateWithHistory', (state, action) => {
  const { innerAction } = action.payload ?? {};
  
  // Save current state to history
  const history = (state as any).history ?? {
    past: [],
    present: state,
    future: []
  };
  
  // Process inner action
  const handler = frameworkHandlers.get(innerAction.type);
  if (!handler) {
    return { state, followUps: [] };
  }
  
  const result = handler(state, innerAction);
  
  return {
    state: {
      ...result.state,
      history: {
        past: [...history.past, state],
        present: result.state,
        future: [] // Clear future on new action
      }
    },
    followUps: result.followUps
  };
});
```

**4. Undo/Redo Toolbar**
```typescript
@customElement('history-controls')
export class HistoryControls extends LitElement {
  render() {
    const history = (this.uiState as any)?.history;
    const canUndo = history?.past?.length > 0;
    const canRedo = history?.future?.length > 0;
    
    return html`
      <button
        ?disabled=${!canUndo}
        @click=${() => dispatchUiEvent(this, 'history/undo')}
      >
        Undo
      </button>
      <button
        ?disabled=${!canRedo}
        @click=${() => dispatchUiEvent(this, 'history/redo')}
      >
        Redo
      </button>
    `;
  }
}
```

---

## Drag & Drop Between Panels

### Use Case
Drag items from asset library to canvas editor.

### Implementation

**1. Drag State Management**
```typescript
frameworkHandlers.register('app/startDrag', (state, action) => {
  const { itemId, itemType, sourcePanel } = action.payload ?? {};
  
  return {
    state: {
      ...state,
      app: {
        ...state.app,
        dragState: {
          itemId,
          itemType,
          sourcePanel,
          active: true
        }
      }
    },
    followUps: []
  };
});

frameworkHandlers.register('app/endDrag', (state, action) => {
  return {
    state: {
      ...state,
      app: {
        ...state.app,
        dragState: null
      }
    },
    followUps: []
  };
});
```

**2. Source Panel (Asset Library)**
```typescript
@customElement('asset-library')
export class AssetLibrary extends LitElement {
  private handleDragStart(event: DragEvent, asset: Asset) {
    event.dataTransfer!.effectAllowed = 'copy';
    event.dataTransfer!.setData('application/json', JSON.stringify(asset));
    
    dispatchUiEvent(this, 'app/startDrag', {
      itemId: asset.id,
      itemType: 'asset',
      sourcePanel: 'asset-library'
    });
  }
  
  private handleDragEnd() {
    dispatchUiEvent(this, 'app/endDrag');
  }
  
  render() {
    return html`
      ${this.assets.map(asset => html`
        <div
          class="asset"
          draggable="true"
          @dragstart=${(e: DragEvent) => this.handleDragStart(e, asset)}
          @dragend=${this.handleDragEnd}
        >
          <img src=${asset.thumbnail} alt=${asset.name} />
          <span>${asset.name}</span>
        </div>
      `)}
    `;
  }
}
```

**3. Target Panel (Canvas Editor)**
```typescript
@customElement('canvas-editor')
export class CanvasEditor extends LitElement {
  private handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }
  
  private handleDrop(event: DragEvent) {
    event.preventDefault();
    
    const data = event.dataTransfer!.getData('application/json');
    const asset = JSON.parse(data);
    
    // Calculate drop position
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Add to canvas
    dispatchUiEvent(this, 'canvas/addItem', {
      asset,
      position: { x, y }
    });
  }
  
  render() {
    const dragState = (this.uiState?.app as any)?.dragState;
    
    return html`
      <div
        class="canvas ${dragState?.active ? 'drag-active' : ''}"
        @dragover=${this.handleDragOver}
        @drop=${this.handleDrop}
      >
        <!-- Canvas content -->
      </div>
    `;
  }
}
```

---

## Real-time Collaboration

### Use Case
Multiple users editing the same document with real-time updates.

### Implementation

**1. Sync State Handler**
```typescript
frameworkHandlers.register('collab/receiveUpdate', (state, action) => {
  const { userId, changes, timestamp } = action.payload ?? {};
  
  // Merge remote changes
  return {
    state: {
      ...state,
      app: {
        ...state.app,
        document: {
          ...state.app.document,
          ...changes
        },
        collaborators: {
          ...state.app.collaborators,
          [userId]: { lastSeen: timestamp }
        }
      }
    },
    followUps: []
  };
});
```

**2. Collaboration Service**
```typescript
class CollaborationService {
  private ws: WebSocket;
  
  constructor() {
    this.ws = new WebSocket('ws://your-server.com/collab');
    this.setupListeners();
  }
  
  private setupListeners() {
    this.ws.addEventListener('message', (event) => {
      const update = JSON.parse(event.data);
      
      // Dispatch to framework
      const root = document.querySelector('framework-root');
      if (root) {
        dispatchUiEvent(root, 'collab/receiveUpdate', update);
      }
    });
  }
  
  sendUpdate(changes: any) {
    this.ws.send(JSON.stringify({
      type: 'update',
      changes,
      timestamp: Date.now()
    }));
  }
}

// Initialize service
const collabService = new CollaborationService();

// Listen for local changes
window.addEventListener('ui-event', ((event: CustomEvent) => {
  const { type, payload } = event.detail;
  
  // Sync document changes
  if (type === 'app/updateDocument') {
    collabService.sendUpdate(payload);
  }
}) as EventListener);
```

**3. Collaboration Indicators**
```typescript
@customElement('collab-indicators')
export class CollabIndicators extends LitElement {
  render() {
    const collaborators = (this.uiState?.app as any)?.collaborators ?? {};
    const users = Object.entries(collaborators);
    
    return html`
      <div class="collaborators">
        ${users.map(([userId, info]: [string, any]) => html`
          <div class="avatar" title=${userId}>
            ${userId.charAt(0).toUpperCase()}
          </div>
        `)}
      </div>
    `;
  }
}
```

---

## Plugin System

### Use Case
Allow third-party plugins to extend the application.

### Implementation

**1. Plugin Interface**
```typescript
interface Plugin {
  id: string;
  name: string;
  version: string;
  
  // Lifecycle hooks
  activate(context: PluginContext): void;
  deactivate(): void;
  
  // Optional extensions
  views?: ViewDefinition[];
  handlers?: Record<string, any>;
  toolbars?: ToolbarDefinition[];
}

interface PluginContext {
  registerView(definition: ViewDefinition): void;
  registerHandler(type: string, handler: any): void;
  registerToolbar(definition: ToolbarDefinition): void;
  getState(): UIState;
  dispatch(type: string, payload?: any): void;
}
```

**2. Plugin Manager**
```typescript
class PluginManager {
  private plugins = new Map<string, Plugin>();
  
  register(plugin: Plugin) {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} already registered`);
    }
    
    // Create context
    const context: PluginContext = {
      registerView: (def) => ViewRegistry.register(def),
      registerHandler: (type, handler) => frameworkHandlers.register(type, handler),
      registerToolbar: (def) => this.registerToolbar(def),
      getState: () => {
        const root = document.querySelector('framework-root');
        return (root as any)?.state ?? {};
      },
      dispatch: (type, payload) => {
        const root = document.querySelector('framework-root');
        if (root) {
          dispatchUiEvent(root, type, payload);
        }
      }
    };
    
    // Activate plugin
    plugin.activate(context);
    this.plugins.set(plugin.id, plugin);
    
    console.log(`Plugin ${plugin.name} activated`);
  }
  
  unregister(pluginId: string) {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.deactivate();
      this.plugins.delete(pluginId);
      console.log(`Plugin ${plugin.name} deactivated`);
    }
  }
}

export const pluginManager = new PluginManager();
```

**3. Example Plugin**
```typescript
const myPlugin: Plugin = {
  id: 'com.example.myplugin',
  name: 'My Plugin',
  version: '1.0.0',
  
  activate(context) {
    // Register custom view
    context.registerView({
      id: 'my-plugin-view',
      name: 'My Plugin View',
      title: 'My Plugin',
      tag: 'my-plugin-view',
      icon: 'extension',
      component: () => import('./my-plugin-view')
    });
    
    // Register custom handler
    context.registerHandler('myplugin/action', (state, action) => {
      return {
        state: {
          ...state,
          myplugin: action.payload
        },
        followUps: []
      };
    });
    
    // Register toolbar
    context.registerToolbar({
      id: 'my-plugin-toolbar',
      position: 'top-right',
      component: () => import('./my-plugin-toolbar')
    });
  },
  
  deactivate() {
    // Cleanup
    console.log('Plugin deactivated');
  }
};

// Register plugin
pluginManager.register(myPlugin);
```

---

## Custom Toolbars

### Use Case
Add custom toolbars with specific functionality.

### Implementation

**1. Toolbar Component**
```typescript
@customElement('custom-toolbar')
export class CustomToolbar extends LitElement {
  @property() toolbarId = 'custom';
  
  static styles = css`
    :host {
      display: flex;
      gap: 8px;
      padding: 8px;
      background: rgba(17, 24, 39, 0.95);
      border-radius: 8px;
    }
    
    button {
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      background: rgba(59, 130, 246, 0.2);
      color: white;
      cursor: pointer;
    }
    
    button:hover {
      background: rgba(59, 130, 246, 0.3);
    }
  `;
  
  render() {
    return html`
      <button @click=${this.handleAction1}>Action 1</button>
      <button @click=${this.handleAction2}>Action 2</button>
    `;
  }
  
  private handleAction1() {
    dispatchUiEvent(this, 'custom/action1');
  }
  
  private handleAction2() {
    dispatchUiEvent(this, 'custom/action2');
  }
}
```

**2. Register Toolbar in Layout**
```typescript
// In WorkspaceRoot or similar
render() {
  return html`
    <!-- Existing toolbars -->
    <dock-container .manager=${this.dockManager} toolbarId="custom">
      <custom-toolbar></custom-toolbar>
    </dock-container>
  `;
}
```

---

## State Persistence

### Use Case
Save and restore application state across sessions.

### Implementation

**1. Persistence Handler**
```typescript
frameworkHandlers.register('app/saveState', (state, action) => {
  const { key = 'app-state' } = action.payload ?? {};
  
  try {
    // Serialize state (exclude non-serializable parts)
    const serializable = {
      layout: state.layout,
      app: (state as any).app,
      theme: state.theme
    };
    
    localStorage.setItem(key, JSON.stringify(serializable));
    
    return {
      state: {
        ...state,
        app: {
          ...state.app,
          lastSaved: Date.now()
        }
      },
      followUps: []
    };
  } catch (error) {
    console.error('Failed to save state:', error);
    return { state, followUps: [] };
  }
});

frameworkHandlers.register('app/loadState', (state, action) => {
  const { key = 'app-state' } = action.payload ?? {};
  
  try {
    const saved = localStorage.getItem(key);
    if (!saved) {
      return { state, followUps: [] };
    }
    
    const parsed = JSON.parse(saved);
    
    return {
      state: {
        ...state,
        ...parsed
      },
      followUps: []
    };
  } catch (error) {
    console.error('Failed to load state:', error);
    return { state, followUps: [] };
  }
});
```

**2. Auto-Save**
```typescript
// In main.ts
let saveTimeout: number;

window.addEventListener('ui-event', (() => {
  clearTimeout(saveTimeout);
  
  saveTimeout = window.setTimeout(() => {
    const root = document.querySelector('framework-root');
    if (root) {
      dispatchUiEvent(root, 'app/saveState');
    }
  }, 2000); // Save 2 seconds after last change
}) as EventListener);
```

**3. Load on Init**
```typescript
// In main.ts after bootstrap
const root = bootstrapFramework({ ... });

// Load saved state
setTimeout(() => {
  dispatchUiEvent(root, 'app/loadState');
}, 100);
```

---

## Summary

These use cases demonstrate:

1. ✅ **Clean Architecture**: Separation of concerns
2. ✅ **Event-Driven**: All updates via dispatch
3. ✅ **Type-Safe**: TypeScript throughout
4. ✅ **Extensible**: Plugin system, custom handlers
5. ✅ **Reactive**: Context-based updates
6. ✅ **Testable**: Pure functions, isolated components

**Remember**: Always use `dispatchUiEvent` for state changes, never mutate context directly!
