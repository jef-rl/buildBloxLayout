# BuildBlox Framework - Improved Demo Package

## 📦 What's Included

This package contains a complete, improved demonstration of the BuildBlox Layout Framework with proper architecture patterns and best practices.

### Files

1. **demo-layout-improved.ts** - Complete UI state definition with proper structure
2. **demo-view-improved.ts** - Example view component demonstrating correct patterns
3. **main-improved.ts** - Bootstrap configuration with logging and event handling
4. **IMPROVED_DEMO_GUIDE.md** - Comprehensive guide to framework architecture
5. **USE_CASES.md** - Real-world implementation examples

---

## 🎯 Key Improvements Over Original Demo

### 1. **Proper Context Usage**
- ❌ **Before**: Direct state mutations
- ✅ **After**: Read-only context consumption via `ContextConsumer`

### 2. **Event-Driven Architecture**
- ❌ **Before**: Mixed state update patterns
- ✅ **After**: All updates via `dispatchUiEvent`

### 3. **Clear Separation of Concerns**
- ❌ **Before**: Views with business logic
- ✅ **After**: Views as pure presentation, handlers for logic

### 4. **Better Documentation**
- ❌ **Before**: Minimal comments
- ✅ **After**: Extensive inline documentation and guides

### 5. **Realistic Use Cases**
- ❌ **Before**: Simple color-coded panels
- ✅ **After**: Interactive demos with state management examples

---

## 🚀 Quick Start

### 1. Replace Existing Demo Files

```bash
# In your playground package
cp demo-layout-improved.ts packages/playground/src/data/demo-layout.ts
cp demo-view-improved.ts packages/playground/src/components/demo-view.ts
cp main-improved.ts packages/playground/src/main.ts
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Demo

```bash
npm run --workspace @project/playground dev
```

### 4. Explore the Demo

- **Toggle Panels**: Click buttons to expand/collapse panels
- **Change Viewport**: Switch between 1x-5x modes
- **View Context**: See real-time state updates
- **Dispatch Actions**: Interact with buttons to trigger events

---

## 📚 Learning Path

### For Beginners

1. Start with **IMPROVED_DEMO_GUIDE.md** - Read sections 1-4
2. Open **demo-view-improved.ts** - Study the component structure
3. Open **main-improved.ts** - See how the framework initializes
4. Run the demo and interact with the UI
5. Open browser DevTools and examine logged events

### For Intermediate Users

1. Read **USE_CASES.md** - Pick 2-3 relevant examples
2. Study **demo-layout-improved.ts** - Understand state structure
3. Try modifying the demo:
   - Add a new view
   - Create a custom handler
   - Add state to the app namespace
4. Review handler implementations in framework source

### For Advanced Users

1. Review the complete **IMPROVED_DEMO_GUIDE.md**
2. Study all **USE_CASES.md** examples
3. Examine framework source code:
   - `/packages/framework/src/handlers/handler-registry.ts`
   - `/packages/framework/src/state/ui-state.ts`
   - `/packages/framework/src/components/layout/FrameworkRoot.ts`
4. Build a custom plugin using the plugin system example

---

## 🎓 Architecture Principles

### 1. Context is Read-Only

```typescript
// ✅ CORRECT
private uiState: UiStateContextValue['state'] | null = null;

private uiStateConsumer = new ContextConsumer(this, {
  context: uiStateContext,
  subscribe: true,
  callback: (value) => {
    this.uiState = value?.state ?? null;
    this.requestUpdate();
  }
});

// ❌ WRONG
this.uiState.layout.expansion.left = true; // NEVER mutate!
```

### 2. Updates via Dispatch

```typescript
// ✅ CORRECT
dispatchUiEvent(this, 'layout/setExpansion', {
  side: 'left',
  expanded: true
});

// ❌ WRONG
this.uiState.layout.expansion.left = true;
this.requestUpdate();
```

### 3. Views are Decoupled

```typescript
// ✅ CORRECT - Via shared context
render() {
  const selection = (this.uiState?.app as any)?.selection;
  return html`<div>Selected: ${selection?.itemId}</div>`;
}

// ❌ WRONG - Direct reference
const otherView = document.querySelector('other-view');
otherView.updateSelection(itemId);
```

---

## 🔧 Common Modifications

### Add a New View

```typescript
// 1. In demo-layout-improved.ts
const NEW_VIEW: View = {
  id: 'my-new-view',
  name: 'My New View',
  component: 'my-new-view',
  data: { label: 'My View', color: '#10b981' }
};

// Add to MAIN_VIEWS or other view array

// 2. Create component file
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('my-new-view')
export class MyNewView extends LitElement {
  render() {
    return html`<div>My New View</div>`;
  }
}

// 3. Register in main-improved.ts (already handled if using VIEW_REGISTRATIONS)
```

### Add Custom State

```typescript
// 1. Register handler
frameworkHandlers.register('myapp/setState', (state, action) => {
  return {
    state: {
      ...state,
      myapp: action.payload
    },
    followUps: []
  };
});

// 2. Use in view
dispatchUiEvent(this, 'myapp/setState', {
  customValue: 'my-data'
});

// 3. Read in view
render() {
  const myapp = this.uiState?.myapp as { customValue?: string };
  return html`<div>${myapp?.customValue}</div>`;
}
```

### Add Custom Toolbar

```typescript
// 1. Create toolbar component
@customElement('my-toolbar')
export class MyToolbar extends LitElement {
  render() {
    return html`
      <button @click=${() => dispatchUiEvent(this, 'my/action')}>
        My Action
      </button>
    `;
  }
}

// 2. Add to WorkspaceRoot.ts
<dock-container .manager=${this.dockManager} toolbarId="my-toolbar">
  <my-toolbar></my-toolbar>
</dock-container>
```

---

## 🐛 Debugging Tips

### Enable Logging

```typescript
// In main-improved.ts (already included)
setFrameworkLogger({
  info: console.log,
  warn: console.warn,
  error: console.error
});
```

### Inspect State

```typescript
// In browser console
__frameworkRoot.state
__frameworkRoot.state.layout
__frameworkRoot.state.panels
```

### Monitor Events

```typescript
// Add to main-improved.ts (already included)
window.addEventListener('ui-event', (event) => {
  console.log('Event:', event.detail);
});
```

---

## 📖 Documentation Reference

| Document | Purpose |
|----------|---------|
| **IMPROVED_DEMO_GUIDE.md** | Complete architecture guide |
| **USE_CASES.md** | Real-world implementation examples |
| **demo-layout-improved.ts** | UI state structure reference |
| **demo-view-improved.ts** | View component patterns |
| **main-improved.ts** | Bootstrap and initialization |

---

## 🎨 Demo Features

### Interactive Elements

- **Expansion Panel Toggles**: Click to expand/collapse left/right/bottom panels
- **Viewport Mode Switcher**: Change between 1x-5x panel layouts
- **Auth Simulation**: Test login/logout state changes
- **Overlay Trigger**: Open settings overlay
- **Real-time State Display**: See current state values

### Visual Indicators

- **Color-coded Views**: Each view has a distinct color
- **Status Badges**: Show login status
- **Panel Counters**: Display active panel counts
- **Expansion Status**: Visual indicators for panel states

### Developer Tools

- **Console Logging**: All events logged to console
- **State Inspector**: Examine state in DevTools
- **Keyboard Shortcuts**: Cmd/Ctrl+B, Cmd/Ctrl+Shift+P
- **Auto-save**: Simulated persistence (see USE_CASES.md)

---

## 🤝 Contributing

### Reporting Issues

If you find issues with the demo or have suggestions:

1. Check **IMPROVED_DEMO_GUIDE.md** for architecture questions
2. Review **USE_CASES.md** for implementation patterns
3. Examine the actual implementation in source files
4. Check browser console for error messages

### Extending the Demo

To add your own examples:

1. Create a new view component following `demo-view-improved.ts` pattern
2. Add view definition to `demo-layout-improved.ts`
3. Register handlers if needed
4. Document your addition in comments

---

## ✅ Checklist for Production

Before moving to production, ensure:

- [ ] Replace demo views with actual application views
- [ ] Remove or disable debug logging
- [ ] Implement proper error boundaries
- [ ] Add loading states for async operations
- [ ] Set up proper state persistence
- [ ] Configure authentication properly
- [ ] Add analytics/telemetry if needed
- [ ] Test keyboard shortcuts
- [ ] Verify responsive behavior
- [ ] Check browser compatibility

---

## 📝 License

This demo is part of the BuildBlox Framework project.

---

## 🙏 Acknowledgments

This improved demo was created to demonstrate:
- ✅ Proper context usage patterns
- ✅ Event-driven state management
- ✅ Clean separation of concerns
- ✅ Type-safe architecture
- ✅ Extensible design patterns

**Built with BuildBlox Framework**  
*Clean • Type-Safe • Extensible*

---

## 📞 Support

For questions about:
- **Architecture**: Read IMPROVED_DEMO_GUIDE.md
- **Patterns**: Check USE_CASES.md
- **Implementation**: Study source files
- **Debugging**: Enable logging and inspect state

---

**Happy Building! 🚀**
