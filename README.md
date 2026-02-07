# BuildBlox Framework

> **A modern, type-safe web application framework for building dynamic workspace layouts with panel-based UIs**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Lit](https://img.shields.io/badge/Lit-3.0+-orange.svg)](https://lit.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

BuildBlox is a production-ready framework for creating sophisticated, IDE-like web applications with resizable panels, dynamic views, and centralized state management. Built on Lit Element and TypeScript, it provides a clean architecture for complex UI applications.

---

## ✨ Features

### 🏗️ **Flexible Layout System**
- **Multi-panel workspace** with left, right, bottom, and main areas
- **Resizable panels** with drag-to-resize functionality
- **Collapsible side panels** for maximizing workspace
- **Viewport modes** (1x-5x) for responsive layouts
- **Overlay views** for settings, dialogs, and modals

### 🎯 **Type-Safe Architecture**
- **Full TypeScript support** with strict typing
- **Immutable state updates** for predictability
- **Pure handler functions** for testability
- **Context-based state distribution** using Lit Context API
- **Event-driven communication** with custom actions

### 🔧 **Extensible Design**
- **View registry** for lazy-loading components
- **Handler registry** for centralized business logic
- **Plugin architecture** for adding features
- **Middleware support** for cross-cutting concerns
- **Custom state namespaces** for application data

### 🚀 **Developer Experience**
- **Hot module replacement** with Vite
- **Comprehensive documentation** and examples
- **Testing utilities** for unit and integration tests
- **Debug logging** with configurable output
- **Live playground** for experimentation

---

## 📦 Project Structure

```
buildblox-framework/
├── packages/
│   ├── framework/          # Core framework package
│   │   ├── nxt/              # NXT framework implementation (only supported runtime)
│   │   │   ├── definitions/    # Serializable definitions + DTOs
│   │   │   ├── reducers/       # Pure state reducers
│   │   │   ├── effects/        # Side-effectful handlers
│   │   │   ├── runtime/        # Core runtime + context wiring
│   │   │   ├── selectors/      # State selectors
│   │   │   ├── views/          # View components and hosts
│   │   │   └── index.ts        # Public API exports
│   │   └── package.json
│   │
│   ├── playground/         # Demo and testing environment
│   │   ├── src/
│   │   │   ├── components/    # Demo view components
│   │   │   ├── data/          # Demo layouts and configurations
│   │   │   └── main.ts        # Playground entry point
│   │   └── package.json
│   │
│   └── app/                # Application template (optional)
│       └── package.json
│
├── FRAMEWORK_DEVELOPMENT_GUIDE.md  # Framework developer guide
├── package.json            # Workspace configuration
└── README.md              # This file
```

> **Note:** The framework package now ships only the NXT implementation; legacy `src` has been retired.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ and npm 8+
- Basic knowledge of **TypeScript** and **Web Components**

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd buildblox-framework
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the playground**

```bash
npm run --workspace @project/playground dev
```

4. **Open your browser**

Navigate to `http://localhost:5173` to see the framework in action!

---

## 💡 Usage

### Basic Setup

```typescript
import { bootstrapFramework } from '@project/framework';

// Define your views
const views = [
  {
    id: 'editor',
    name: 'Editor',
    title: 'Code Editor',
    tag: 'editor-view',
    icon: '📝',
    component: () => import('./views/editor-view')
  },
  {
    id: 'preview',
    name: 'Preview',
    title: 'Live Preview',
    tag: 'preview-view',
    icon: '👁️',
    component: () => import('./views/preview-view')
  }
];

// Initialize the framework
bootstrapFramework({
  views,
  state: {
    panels: [
      {
        id: 'left-panel',
        region: 'left',
        views: ['explorer']
      },
      {
        id: 'main-panel-1',
        region: 'main',
        views: ['editor']
      }
    ]
  }
});
```

### Creating a View Component

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { uiStateContext, dispatchUiEvent } from '@project/framework';
import type { UiStateContextValue } from '@project/framework';

@customElement('my-view')
export class MyView extends LitElement {
  // Consume framework state
  @consume({ context: uiStateContext, subscribe: true })
  @property({ attribute: false })
  uiState?: UiStateContextValue;
  
  private handleAction() {
    // Dispatch action to update state
    dispatchUiEvent(this, 'myapp/action', {
      data: 'value'
    });
  }
  
  render() {
    const appState = this.uiState?.state.myApp;
    
    return html`
      <div class="my-view">
        <h2>My View</h2>
        <p>State: ${JSON.stringify(appState)}</p>
        <button @click=${this.handleAction}>Update</button>
      </div>
    `;
  }
  
  static styles = css`
    .my-view {
      padding: 1rem;
    }
  `;
}
```

### Creating a Handler

```typescript
import type { UIState, HandlerAction, HandlerResult } from '@project/framework';

export const myAppHandlers = {
  'myapp/action': (state: UIState, action: HandlerAction): HandlerResult<UIState> => {
    return {
      state: {
        ...state,
        myApp: {
          ...state.myApp,
          data: action.payload.data
        }
      },
      followUps: []
    };
  }
};
```

---

## 🏛️ Architecture

BuildBlox follows the **View-Context-Handler Protocol**, a unidirectional data flow pattern:

```
┌──────────────────────────────────────────────────────────┐
│                  User Interaction                        │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  View dispatches action via dispatchUiEvent()            │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  Handler processes action and returns new state          │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  Context distributes updated state to all views          │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  Views re-render with new state                          │
└──────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Views are Pure Presentation** - Components display data and report user intentions
2. **Context Provides Read-Only State** - State access through Lit Context API
3. **Handlers are the Only State Mutators** - All changes flow through pure functions
4. **Type Safety Throughout** - Full TypeScript coverage with strict typing
5. **Immutable Updates** - State is never mutated, always replaced

---

## 📚 Documentation

### For Users

- **[Quick Start Guide](docs/QUICK_START.md)** - Get up and running in 5 minutes *(coming soon)*
- **[View Development Guide](docs/VIEW_DEVELOPMENT.md)** - Creating custom views *(coming soon)*
- **[State Management Guide](docs/STATE_MANAGEMENT.md)** - Working with application state *(coming soon)*
- **[API Reference](docs/API_REFERENCE.md)** - Complete API documentation *(coming soon)*

### For Framework Developers

- **[Framework Development Guide](FRAMEWORK_DEVELOPMENT_GUIDE.md)** - Comprehensive guide for extending the framework
- **[Architecture Overview](FRAMEWORK_DEVELOPMENT_GUIDE.md#architecture-philosophy)** - Deep dive into the architecture
- **[Testing Guide](FRAMEWORK_DEVELOPMENT_GUIDE.md#testing-strategy)** - Testing strategies and examples

---

## 🧪 Examples

### Playground Demo

The playground package includes a complete demonstration:

```bash
npm run --workspace @project/playground dev
```

**Features demonstrated:**
- Multi-panel layout with resizable panels
- View registration and lazy loading
- State management and actions
- Panel expansion/collapse
- Viewport mode switching
- Overlay views

### Example Applications

See the `packages/playground` directory for:
- **Demo views** - Example view components
- **Demo layout** - Complete workspace configuration
- **Custom handlers** - Application-specific state handlers
- **Interactive examples** - Buttons, forms, state display

---

## 🛠️ Development

### Setup Development Environment

```bash
# Install dependencies
npm install

# Build framework
npm run --workspace @project/framework build

# Run playground in dev mode
npm run --workspace @project/playground dev

# Run tests (when available)
npm test
```

### Monorepo Structure

This is an npm workspaces monorepo:

- **`packages/framework`** - Core framework library
- **`packages/playground`** - Demo and testing environment
- **`packages/app`** - Application template (optional)

### Adding a New Package

```bash
# Create package directory
mkdir -p packages/my-package

# Add package.json
cd packages/my-package
npm init -y

# Install dependencies
npm install @project/framework lit
```

---

## 🧩 Key Concepts

### Panels

Panels are structural containers in the workspace:

```typescript
{
  id: 'panel-1',
  region: 'left' | 'right' | 'bottom' | 'main',
  views: ['view-id-1', 'view-id-2']
}
```

### Views

Views are reusable components registered with the framework:

```typescript
{
  id: 'unique-id',
  name: 'Display Name',
  title: 'Full Title',
  tag: 'custom-element-tag',
  icon: '📝',
  component: () => import('./view-component')
}
```

### State

Centralized application state:

```typescript
{
  panels: Panel[],
  views: View[],
  layout: {
    expansion: { left, right, bottom },
    overlayView: string | null,
    viewportWidthMode: '1x' | '2x' | '3x' | '4x' | '5x'
  },
  // Your custom state
  myApp: { ... }
}
```

### Handlers

Pure functions that transform state:

```typescript
(state: UIState, action: HandlerAction) => {
  return {
    state: newState,        // Immutable update
    followUps: [actions]    // Subsequent actions
  };
}
```

---

## 📊 Performance

- **Lazy loading** - Views loaded on-demand
- **Efficient updates** - Only affected components re-render
- **Virtual scrolling** - Handle large lists efficiently
- **Memoization** - Cache computed values
- **Tree shaking** - Only bundle what you use

---

## 🧪 Testing

### Testing Views

```typescript
import { fixture, html, expect } from '@open-wc/testing';
import { MyView } from './my-view';

describe('MyView', () => {
  it('renders correctly', async () => {
    const el = await fixture<MyView>(html`
      <my-view></my-view>
    `);
    
    expect(el.shadowRoot?.textContent).to.include('My View');
  });
});
```

### Testing Handlers

```typescript
import { describe, it, expect } from 'vitest';
import { myHandler } from './my-handler';

describe('myHandler', () => {
  it('updates state correctly', () => {
    const state = { myApp: { value: 0 } };
    const result = myHandler(state, {
      type: 'myapp/increment',
      payload: {}
    });
    
    expect(result.state.myApp.value).toBe(1);
  });
});
```

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass
- Follow TypeScript best practices

---

## 📝 Roadmap

- [x] Core framework architecture
- [x] Panel and view system
- [x] State management with context
- [x] Handler registry
- [x] View registry with lazy loading
- [x] Comprehensive documentation
- [ ] Additional UI components
- [ ] Plugin marketplace
- [ ] Visual layout editor
- [ ] State persistence utilities
- [ ] Authentication integration
- [ ] Theming system
- [ ] Accessibility improvements

---

## 🔗 Resources

### Official

- **[Framework Development Guide](FRAMEWORK_DEVELOPMENT_GUIDE.md)** - Complete framework documentation
- **[Playground Demo](packages/playground)** - Live examples and demos

### External

- **[Lit Element](https://lit.dev/)** - Web component library
- **[Lit Context](https://lit.dev/docs/data/context/)** - Context API documentation
- **[TypeScript](https://www.typescriptlang.org/)** - TypeScript language
- **[Vite](https://vitejs.dev/)** - Build tool

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

BuildBlox Framework is built with:

- **[Lit](https://lit.dev/)** - Fast, lightweight web components
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Next generation frontend tooling

Special thanks to all contributors and the open source community.

---

## 💬 Support

- **Documentation**: [Framework Development Guide](FRAMEWORK_DEVELOPMENT_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/buildblox-framework/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/buildblox-framework/discussions)

---

## 🎯 Use Cases

BuildBlox is perfect for:

- 📝 **Code Editors** - IDE-like interfaces with multiple panels
- 🎨 **Design Tools** - Canvas with toolbars and property panels
- 📊 **Dashboards** - Analytics with customizable layouts
- 🗂️ **File Managers** - Explorer-style applications
- 🛠️ **Admin Panels** - Complex management interfaces
- 📱 **Multi-pane Apps** - Any application with resizable regions

---

**Built with ❤️ by the BuildBlox Team**

*Extensible • Type-Safe • Production-Ready*
