# View Development Guide

## Overview

This guide explains how to create views for the framework and register them so they can be displayed in panels. A **view** is a self-contained web component that renders content within a panel in your workspace. Views are written as Lit elements and registered with the framework's view registry.

## Understanding the View System

Before writing your first view, it's essential to understand the framework's core architecture. The framework is built on a unidirectional data flow pattern that creates a clear separation between presentation and business logic. This architecture is sometimes called "The View-Context-Handler Protocol" and it represents the correct and only supported way to build applications with this framework.

### The View-Context-Handler Protocol

Every component in the framework follows a strict data flow pattern. Understanding this pattern is crucial because it governs how your views will read data, how they'll communicate changes, and how the application state evolves over time. Think of this as the "contract" between your view code and the framework itself.

**The Three Pillars of the Architecture:**

The framework's architecture rests on three interconnected concepts that work together to create a predictable, maintainable system. These aren't just guidelines—they're the fundamental building blocks that make the framework function correctly.

**Views are pure presentation components.** A view's only job is to render a user interface based on the data it receives. Views should never directly modify application state. They observe state through context and display it to the user. When users interact with a view (clicking buttons, entering text, making selections), the view doesn't change state directly. Instead, it dispatches actions that describe what the user wants to accomplish. Think of views as observers and reporters—they watch state and report user intentions, but they never make decisions about how state should change.

**Context provides read-only access to framework state.** The framework maintains a single, centralized state object that contains everything about the current workspace: which panels are open, which views are visible, what the user's authentication status is, and any custom application data you add. Views access this state through the React-inspired Context API. When a view consumes context, it receives a snapshot of the current state and a dispatch function. The state portion is strictly read-only—your view can read values from it, but it cannot modify it. This read-only guarantee is what makes the framework predictable: you always know that views can't create unexpected side effects by mutating shared state.

**Handlers are the only way to modify state.** When a view needs to change something—open a panel, save a document, update user preferences—it dispatches an action. This action is a plain JavaScript object with a type string and a payload containing any relevant data. The framework routes this action through a handler registry, which looks up the appropriate handler function for that action type. The handler receives the current state and the action, computes what the new state should be, and returns it. The framework then replaces the old state with the new state and notifies all views that are watching that state. This creates a unidirectional flow: views dispatch actions, handlers process actions and return new state, context distributes new state back to views, and views re-render with the updated state.

**Why This Architecture Matters:**

You might wonder why the framework enforces this pattern rather than allowing views to modify state directly. The answer lies in the benefits this architecture provides, benefits that become more valuable as your application grows in complexity.

When all state changes flow through handlers, you get complete visibility into what's happening in your application. Every state change is an explicit action that can be logged, inspected, and replayed. If something goes wrong, you can look at the action log and see exactly what sequence of actions led to the problem. This is vastly superior to trying to debug state changes scattered throughout dozens of view components where any component might modify state at any time.

The architecture creates natural boundaries for testing. You can test handlers in complete isolation without mounting components or setting up DOM environments—they're just pure functions that transform state. You can test views in isolation by providing mock context values without needing the entire framework running. This separation makes your tests faster, more focused, and easier to maintain.

Perhaps most importantly, this architecture scales gracefully. When you need to add new features, you register new handlers for new action types. Your existing handlers don't need to change, and your existing views don't need to know about the new features unless they explicitly want to use them. The separation of concerns means you can modify how a feature works by changing a handler without touching any view code, or you can redesign a view's appearance without changing any business logic.

**The Complete Data Flow Cycle:**

To truly understand how the framework works, let's trace a complete cycle from user action to state update to UI refresh. Imagine a user clicks a button to save a document. Here's the exact sequence of events that occurs:

First, the user clicks the save button in your document editor view. The view's event handler calls `dispatchUiEvent(this, 'document/save', { content, title, timestamp })`. This creates a custom DOM event that bubbles up from your view component.

The event bubbles up through the DOM tree until it reaches the `FrameworkRoot` component at the top of the hierarchy. The framework root is listening for these special `ui-event` events. When it catches one, it extracts the action type and payload from the event detail.

The framework root passes this action to its internal dispatch system, which adds it to an action queue. The queue ensures that actions are processed in order and that follow-up actions generated by handlers are executed in the correct sequence.

The dispatch system looks up the handler registered for the `document/save` action type. It calls this handler function, passing in the current application state and the action object. The handler executes synchronously—it might update state to record the save operation, increment a save counter, update a last-modified timestamp, or trigger any other state changes your application needs. The handler returns a result object containing the new state and optionally an array of follow-up actions to execute next.

The framework replaces the current state with the new state returned by the handler. This state replacement is atomic—the old state is immutable and remains unchanged, while the new state becomes the current state. Any views that are consuming context and watching this state will be notified of the change.

The context system pushes the new state to all consuming views. Each view's context consumer callback fires with the updated state value. Views store this new state in their local properties and call `requestUpdate()` to trigger a re-render. Lit's rendering system re-renders each view with the updated state, and the DOM updates to reflect the changes.

If the handler returned any follow-up actions, those actions now execute by following the same process. Follow-up actions might open a panel to show success feedback, update a status indicator, or trigger any other downstream effects. The entire cycle—from user click to handler execution to view re-render—typically completes in milliseconds.

**What This Means For Your Code:**

When you write views for this framework, you're not writing standalone components that manage their own state and make their own decisions. You're writing presentation components that participate in a larger orchestrated system. Your view receives state through context, displays it to users, captures user interactions, and translates those interactions into action dispatches. The framework and your handlers take care of the rest.

This might feel restrictive at first, especially if you're used to frameworks where components have more autonomy. But this restriction is intentional and beneficial. By constraining how components can behave, the framework makes the overall system more predictable and maintainable. You trade local flexibility for global consistency, and that trade becomes increasingly valuable as your application grows.

In the sections that follow, you'll learn the specific techniques for writing views that work within this architecture: how to consume context to read state, how to dispatch actions to request changes, how to register handlers to process those actions, and how to organize your code to keep business logic separate from presentation logic. These aren't just best practices—they're the fundamental skills you need to work effectively with this framework.

## Understanding Views in the Framework Context

Before writing your first view, let's clarify what views are and aren't within this framework's architecture## Understanding Views in the Framework Context

Before writing your first view, let's clarify what views are and aren't within this framework's architecture. This clarity will help you write components that work harmoniously with the framework rather than fighting against it.

Views are Lit-based web components that participate in the View-Context-Handler protocol. They are not autonomous widgets that manage their own state in isolation. Every view you create becomes part of a larger coordinated system where data flows in one direction and state changes follow a predictable path through the handler registry. Understanding this role is essential to using the framework correctly.

A view has three primary responsibilities within the protocol. First, it consumes context to access the current application state. When you write a view, you'll use the `ContextConsumer` from `@lit/context` to subscribe to the framework's state context. This gives your view read-only access to the entire application state tree, including panel configuration, layout settings, authentication status, and any custom state your handlers maintain. The view receives updates whenever this state changes, and Lit's reactive system ensures your UI stays in sync with the state.

Second, the view renders a user interface based on the properties and state it receives. This rendering should be purely presentational—given the same props and state, your view should always render the same output. There should be no side effects in the render method, no API calls, no state mutations. The render method is a pure function that transforms data into DOM elements. This purity is what makes your views predictable and easy to test.

Third, when users interact with your view, the view dispatches actions to communicate those interactions to the framework. A button click doesn't directly save a document—it dispatches a `document/save` action. A form submission doesn't directly update user preferences—it dispatches a `preferences/update` action. The view's job is to accurately report what the user wants to do, not to implement the actual behavior. That implementation lives in handlers where it can be centralized, tested, and reused.

Views should never directly mutate application state. This bears repeating because it's the most common mistake developers make when first learning this architecture. You might be tempted to update a local variable, modify an object in context, or call an imperative method to change something. Resist this temptation. Every state change must flow through the handler registry. This discipline is what gives the framework its power—when every change goes through handlers, you get action logging, state snapshots, undo/redo, time-travel debugging, and a clear audit trail of everything that happens in your application.

Similarly, views should avoid internal stateful logic beyond basic UI concerns. If a piece of state affects application behavior or needs to persist across component remounts, it belongs in the application state managed by handlers, not in component-local state. Use Lit's `@state()` decorator for purely presentational concerns like whether a dropdown is open or which tab is currently selected, but dispatch actions for anything that represents meaningful application state like which document is being edited or what the user's preferences are.

The framework enforces this pattern through its architecture. Views don't receive a mutable state object they can modify. They receive a read-only snapshot through context and a `dispatch` function for requesting changes. This design makes it physically difficult to violate the protocol—you'd have to work hard to circumvent it, and the code would be obviously wrong. When you follow the protocol, your code flows naturally and the framework's features just work.

Understanding this role helps you think correctly about view design. When you sit down to write a view, your mental model should be: "This component observes state from context, renders UI based on that state, and dispatches actions when users interact with it." Not "This component manages data and implements features." The data management and feature implementation happen in handlers. The view is just the presentation layer that makes that functionality accessible to users.

This separation creates healthy boundaries in your codebase. Your view code stays focused on UI concerns—layout, styling, event handling, accessibility. Your handler code stays focused on business logic—validation, computation, state transformation. Each layer has a clear job, and the interfaces between them are explicit and well-defined. This is how the framework achieves maintainability at scale.

### The Protocol in Practice: A Quick Reference

Now that you understand the philosophy behind the View-Context-Handler protocol, here's a concrete reference you can return to as you build your views. Think of this as the "rules of engagement" for working with the framework.

**What Views Should Do:**

Your views should consume the UI state context using `ContextConsumer` to receive the current application state. This gives you read-only access to framework state, panel configuration, authentication status, and any custom state your application maintains. The context consumer automatically triggers re-renders when the state changes, keeping your UI in sync with the application state.

When users interact with your view, dispatch actions using `dispatchUiEvent(this, actionType, payload)`. These actions describe what the user wants to accomplish. The action type is a string identifier like `document/save` or `layout/setExpansion`, and the payload is an object containing any data the handler needs to process the action. Every user interaction that should change application state must go through an action dispatch—there are no exceptions to this rule.

Use the `@property()` decorator to accept configuration data that flows in from the panel system. The framework convention is to support a `data` property for framework-managed data passing, along with individual properties for specific common values like `label` or `color`. This makes your view flexible enough to work both within the framework's panel system and as a standalone component if needed.

Render your UI based on the combination of props and context state. Your render method should be a pure function—given the same props and state, it always produces the same output. Avoid side effects in render methods, and never modify state during rendering. The render method observes data and produces DOM, nothing more.

Use Lit's `@state()` decorator for purely presentational local state like whether a dropdown menu is currently open or which tab in a tab set is active. This kind of UI-only state doesn't need to flow through handlers because it doesn't represent meaningful application state. If state affects application behavior or should persist across component remounts, it belongs in the application state managed by handlers instead.

**What Views Should Never Do:**

Never directly mutate the context state object. The state you receive from context is read-only. Attempting to modify it will either have no effect or cause unpredictable behavior. All state modifications must go through handler dispatch—this is the foundation of the framework's predictability.

Never call imperative methods or APIs to modify framework state. There is no `framework.setPanelState()` or `workspace.openOverlay()` method to call. The only way to request state changes is through action dispatch. This constraint is intentional and beneficial—it ensures every state change is logged, can be replayed, and flows through the predictable handler pipeline.

Never store application-meaningful state in component instance variables or using `@state()` if that state represents something that should survive component unmounting or should be accessible to other parts of the application. Component-local state is lost when the component unmounts. If it matters, it goes in the application state and flows through handlers.

Never implement business logic directly in your view event handlers. When a user clicks "save", your event handler should dispatch a `document/save` action, not implement the actual save logic. The save logic belongs in a handler where it can be tested independently, reused across different views, and modified without touching view code.

Never bypass the action dispatch system by maintaining parallel state management or using external state libraries within a view. The framework provides a centralized state system through the context and handlers. Using separate state management defeats the purpose of the architecture and creates confusion about which state is authoritative.

**What Handlers Should Do:**

Your handlers should be pure functions that receive current state and an action, then return new state. The new state should be a fresh object created by spreading the old state and overwriting specific properties. Never mutate the incoming state object—always create and return a new one.

When registering handlers with `frameworkHandlers.register(actionType, handlerFn)`, use namespaced action types to avoid collisions. Standard namespaces include `layout/`, `panels/`, `auth/`, and `session/` for framework concerns, and domain-specific namespaces like `document/`, `user/`, or `project/` for your application logic.

Handlers should return a result object with two properties: `state` (the new application state) and `followUps` (an array of additional actions to execute). Even if there are no follow-up actions, return an empty array—this maintains consistency with the handler contract and makes your code predictable.

Use follow-up actions to orchestrate multi-step workflows. If saving a document should also close a modal and show a success message, the save handler can return follow-up actions for those operations. This keeps the orchestration logic centralized in handlers rather than scattered across views.

Keep handlers synchronous. If you need to perform asynchronous operations like API calls, trigger the async operation as a side effect but return immediately with an updated state (perhaps setting a loading flag). When the async operation completes, dispatch another action to update state with the results. This pattern maintains the synchronous handler contract while still supporting async operations.

**The Framework's Responsibilities:**

Understanding what the framework itself handles helps clarify what you need to do versus what's done for you. The framework manages the complete lifecycle of view instances. When a view is registered and assigned to a panel, the framework creates the component instance, applies initial properties from the view's data object, mounts it in the DOM within the panel's container, and unmounts and cleans it up when it's no longer needed. You never manually instantiate view components.

The framework routes all dispatched actions through the handler registry. When your view dispatches an action using `dispatchUiEvent`, the framework catches the event as it bubbles up the DOM, extracts the action type and payload, looks up the registered handler for that action type, executes the handler with current state and the action, applies the returned state to become the new current state, processes any follow-up actions returned by the handler, and notifies all context consumers of the state change. This entire pipeline is handled automatically—you just dispatch actions and write handlers.

The framework provides the context infrastructure that distributes state to all consuming views. When state changes, every view that's consuming context receives the updated state snapshot. The framework ensures these updates happen efficiently and that views only re-render when necessary.

The framework manages panel layout, view assignment, expansion states, viewport modes, and all the structural concerns of the workspace. Your views don't need to know about panel widths, whether expanders are open, or where they're positioned. They just render content and dispatch actions. The framework orchestrates the workspace structure.

This division of responsibilities is what makes the framework powerful. You focus on writing views that present data and handlers that transform state. The framework handles routing, lifecycle, context distribution, and workspace management. Each layer does its job, and the interfaces between them are clean and well-defined.

## Writing a Basic View

Now that you understand the View-Context-Handler protocol, let's write your first view. We'll start with the simplest possible implementation that still follows the protocol correctly, then progressively add features to demonstrate how views work within the framework.

A view is a Lit element decorated with `@customElement`. At its core, it's just a web component that follows the framework's conventions. Here's the absolute minimum viable view:

```typescript
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('my-simple-view')
export class MySimpleView extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      width: 100%;
      padding: 16px;
    }
  `;

  render() {
    return html`
      <div>Hello from my view!</div>
    `;
  }
}
```

This creates a web component with the tag name `my-simple-view` that will fill its container and display a simple message. Notice that this view doesn't interact with context or dispatch any actions—it's purely presentational. That's perfectly fine for views that just display static content. Not every view needs to participate in every aspect of the protocol. A view that never needs to read framework state doesn't need a context consumer, and a view that never triggers state changes doesn't need to dispatch actions.

However, as soon as your view needs to know about the framework's state or communicate with it, you'll incorporate the relevant parts of the protocol. Let's see how.

### Key Points for Basic Views

When you write the `@customElement` decorator, you're registering your class as a custom element with the browser. The string you pass must be a valid HTML custom element name, which means it must contain at least one hyphen and be lowercase. Common patterns include prefixing all your views with a namespace like `app-editor-view` or using domain-specific prefixes like `document-editor`.

The `:host` selector in your CSS refers to the custom element itself (the root of your component). Because views render inside framework panels that have specific size constraints, you almost always want to set `display: block`, `height: 100%`, and `width: 100%` on `:host`. This ensures your view fills the available panel space rather than collapsing to the size of its content. The framework uses flexbox and CSS grid for panel layout, and your view needs to participate correctly in that layout system.

The `render` method is where you return the HTML template for your view. Lit uses tagged template literals with the `html` function to create templates. These templates are reactive—when your component's properties change, Lit efficiently updates only the parts of the DOM that need to change. This method should be pure: given the same component properties, it should always produce the same output. Avoid side effects like API calls or state modifications in render methods. The render method observes state and produces DOM, nothing else.

## Adding Properties to Accept Data

Within the View-Context-Handler protocol, properties serve as the input mechanism for view-specific configuration. While context provides access to global framework state that all views can read, properties let you pass specific data to individual view instances. This makes each instance configurable and reusable in different contexts with different data.

When the framework assigns a view to a panel, it can pass a data object that configures that specific instance. For example, you might have a document editor view where each instance edits a different document, or a chart view where each instance displays different data. Properties are how you receive that instance-specific configuration.

Use Lit's `@property` decorator to define reactive properties on your view. When a property's value changes, Lit automatically re-renders the component with the new value. This reactivity is what keeps your UI in sync with your data without requiring manual DOM manipulation.

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('configurable-view')
export class ConfigurableView extends LitElement {
  // Simple string property with a default value
  @property() label = 'Default Label';
  
  // String property with explicit type annotation for attribute conversion
  @property({ type: String }) color = '#eee';
  
  // Object property for complex data structures
  @property({ type: Object }) data: { label?: string; color?: string } | null = null;

  static styles = css`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
    .content {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: monospace;
      font-size: 1.2rem;
    }
  `;

  render() {
    // Properties from the data object take precedence over individual properties
    // This follows the framework convention for data passing
    const displayLabel = this.data?.label ?? this.label;
    const displayColor = this.data?.color ?? this.color;

    return html`
      <div class="content" style="background-color: ${displayColor}">
        <div>${displayLabel}</div>
      </div>
    `;
  }
}
```

### Understanding the Property Pattern

This example demonstrates the framework's recommended property pattern, which balances flexibility with convention. You define individual properties like `label` and `color` with sensible defaults, making your component usable even when no data is provided. You also define a `data` property that can hold any object structure, which is how the framework's panel system will pass configuration to your view.

In your render method, you prioritize values from the `data` object over the individual property defaults. This pattern means the framework can pass configuration through the `data` object (following the framework convention), but your component also works as a standalone element where properties can be set individually through HTML attributes or JavaScript property assignment. This dual interface makes your views flexible without complicating your code.

The `type` option in the `@property` decorator tells Lit how to deserialize HTML attribute values. When you use your component in HTML like `<configurable-view color="#ff0000"></configurable-view>`, Lit needs to know that the color attribute should be treated as a string. The type can be `String`, `Number`, `Boolean`, `Array`, or `Object`. For complex types like objects and arrays, Lit will attempt to JSON-parse the attribute value, which is why you typically set these properties through JavaScript rather than HTML attributes.

Property defaults are important because they ensure your view works even when no configuration is provided. This makes your views more resilient and easier to test—you can instantiate a view without providing any props and it will render something reasonable rather than showing errors or blank space. Defaults also serve as documentation, showing developers what values are expected and what the fallback behavior is.

Lit's reactivity system automatically monitors decorated properties. When a property value changes, Lit schedules a re-render of the component. This happens asynchronously and efficiently—multiple property changes in rapid succession will result in just one re-render. You never need to manually call update methods or manipulate the DOM yourself. Just change the property value, and Lit handles the rest. This automatic reactivity is what makes Lit components feel declarative rather than imperative.

The framework's panel system passes data to views through the `data` property by convention. When you dispatch an action like `panels/assignView` with a data payload, that data becomes the view's `data` property value. The framework doesn't directly set individual properties—it uses the generic `data` property as the data transfer mechanism. This is why your render method checks `this.data?.label ?? this.label`—it's pulling from the framework-provided data object first, with individual properties serving as fallbacks for standalone usage.

This property pattern creates a clean separation between framework-managed views (which receive data through the `data` property) and standalone usage (which can set individual properties). Your view doesn't need to know or care whether it's being used within the framework or as a standalone component. It just checks for data in both places and uses whatever it finds. This flexibility makes your views more reusable across different contexts.

## Accessing Framework State

Many views need to read workspace state like the current user's authentication status or panel configuration. Use the `ContextConsumer` from `@lit/context` to access the framework's UI state:

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext, type UiStateContextValue } from '@project/framework';

@customElement('stateful-view')
export class StatefulView extends LitElement {
  @property() label = 'Stateful View';

  // Store the UI state locally
  private uiState: UiStateContextValue['state'] | null = null;

  // Create a context consumer that subscribes to state changes
  private uiStateConsumer = new ContextConsumer(this, {
    context: uiStateContext,
    subscribe: true,
    callback: (value: UiStateContextValue | undefined) => {
      this.uiState = value?.state ?? null;
      this.requestUpdate();
    },
  });

  static styles = css`
    :host {
      display: block;
      height: 100%;
      padding: 16px;
    }
    .status {
      margin-top: 0.5rem;
      font-size: 0.9rem;
      opacity: 0.75;
    }
  `;

  render() {
    const auth = this.uiState?.auth;
    const isLoggedIn = auth?.isLoggedIn ?? false;
    const userEmail = auth?.user?.email ?? 'Not available';

    return html`
      <div>
        <h3>${this.label}</h3>
        <div class="status">
          Status: ${isLoggedIn ? 'Logged in' : 'Logged out'}
        </div>
        ${isLoggedIn ? html`
          <div class="status">User: ${userEmail}</div>
        ` : ''}
      </div>
    `;
  }
}
```

### Understanding Context Consumption

**The `ContextConsumer`** — This is a reactive controller that connects your component to a context provider higher in the component tree (the `FrameworkRoot` in this case).

**The `subscribe` option** — Setting this to `true` means your view will automatically re-render whenever the context value changes.

**The callback** — This function runs whenever the context value changes. Store the state in a local property and call `requestUpdate()` to trigger a re-render.

**Available state** — The `uiState` object contains:
- `auth` — Authentication state (isLoggedIn, user)
- `panels` — Array of all panels
- `views` — Array of all view instances
- `layout` — Layout configuration (expansion states, viewport mode, main view order)
- `activeView` — ID of the currently active view

## Dispatching Framework Actions

Views communicate with the framework by dispatching actions through the central handler registry. This ensures all state mutations flow through a single, controlled pathway that maintains consistency and enables features like state logging, undo/redo, and state persistence.

The framework provides the `dispatchUiEvent` helper function, which creates properly formatted action messages that bubble up to the `FrameworkRoot` component. The root then routes these actions through the handler registry, which applies state changes and can trigger follow-up actions.

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { dispatchUiEvent } from '@project/framework';

@customElement('interactive-view')
export class InteractiveView extends LitElement {
  @property() viewId = '';

  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }
    button {
      padding: 8px 16px;
      margin: 4px;
      border-radius: 4px;
      border: 1px solid #444;
      background: #222;
      color: #fff;
      cursor: pointer;
    }
    button:hover {
      background: #333;
    }
  `;

  // Method to close the overlay (if this view is in an overlay)
  private closeOverlay() {
    dispatchUiEvent(this, 'layout/setOverlayView', { viewId: null });
  }

  // Method to toggle the left panel
  private toggleLeftPanel() {
    dispatchUiEvent(this, 'layout/setExpansion', {
      side: 'left',
      expanded: true
    });
  }

  render() {
    return html`
      <div>
        <h3>Interactive View</h3>
        <button @click=${this.closeOverlay}>Close Overlay</button>
        <button @click=${this.toggleLeftPanel}>Open Left Panel</button>
      </div>
    `;
  }
}
```

### Understanding the Handler-Based Architecture

**Why handler-based dispatch?** — Instead of views directly mutating shared state or calling imperative methods, all state changes flow through a centralized handler registry. This architecture provides several benefits:

- **Single source of truth** — All state mutations happen in one place, making the codebase easier to understand and debug
- **Predictable state changes** — Handlers are pure functions that take current state and an action, then return new state
- **Action logging** — Every state change is an action object that can be logged for debugging
- **Time-travel debugging** — You can replay actions to recreate any application state
- **Follow-up actions** — Handlers can return additional actions to execute, enabling complex workflows
- **Testability** — Handlers are pure functions that are easy to unit test

**The dispatch flow** — When you call `dispatchUiEvent(this, 'layout/setExpansion', { side: 'left', expanded: true })`, here's what happens:

1. A custom event is created with the type and payload you provided
2. The event bubbles up the DOM tree from your view component
3. `FrameworkRoot` catches the event and extracts the action (type + payload)
4. The action is passed to the handler registry's `handle` method
5. The registry looks up the appropriate handler for the action type
6. The handler function executes, receiving current state and the action
7. The handler returns new state and any follow-up actions
8. The framework updates its state and triggers re-renders
9. Follow-up actions are queued and processed in sequence

**The `dispatchUiEvent` function** — This is the only way views should communicate with the framework. The first argument is the element dispatching the event (usually `this` or `window`), the second is the action type string, and the third is the payload object containing any additional data the handler needs.

### Available Action Types

The framework provides several built-in action types organized by domain. These are the actions your views will most commonly dispatch:

**Layout Actions** — These control the workspace layout structure:

- `layout/setExpansion` — Open or close expander panels
  - Payload: `{ side: 'left' | 'right' | 'bottom', expanded: boolean }`
  - Example: `dispatchUiEvent(this, 'layout/setExpansion', { side: 'left', expanded: true })`

- `layout/setOverlayView` — Show or hide an overlay view
  - Payload: `{ viewId: string | null }`
  - Example: `dispatchUiEvent(this, 'layout/setOverlayView', { viewId: 'settings' })`
  - Note: Pass `null` to close the overlay

- `layout/setViewportWidthMode` — Change how many panels are visible in the viewport
  - Payload: `{ mode: 'auto' | '1x' | '2x' | '3x' | '4x' | '5x' }`
  - Example: `dispatchUiEvent(this, 'layout/setViewportWidthMode', { mode: '2x' })`

- `layout/setMainAreaCount` — Set the number of main area panels
  - Payload: `{ count: number }` (clamped to 1-5)
  - Example: `dispatchUiEvent(this, 'layout/setMainAreaCount', { count: 3 })`

**Panel Actions** — These manage panel contents and view assignments:

- `panels/assignView` — Assign a view to a panel (with optional data)
  - Payload: `{ viewId: string, panelId?: string, data?: unknown }`
  - Example: `dispatchUiEvent(this, 'panels/assignView', { viewId: 'editor', data: { fileName: 'main.ts' } })`
  - Note: If `panelId` is omitted, uses the currently selected panel

- `panels/setMainViewOrder` — Reorder which views appear in the main area slots
  - Payload: `{ viewOrder: string[] }`
  - Example: `dispatchUiEvent(this, 'panels/setMainViewOrder', { viewOrder: ['editor', 'preview', 'console'] })`

- `panels/selectPanel` — Mark a panel as selected (for subsequent operations)
  - Payload: `{ panelId: string }`
  - Example: `dispatchUiEvent(this, 'panels/selectPanel', { panelId: 'panel-main-1' })`

- `panels/togglePanel` — Toggle a panel's open/closed state
  - Payload: `{ panelId: string }` or `{ viewId: string }`
  - Example: `dispatchUiEvent(this, 'panels/togglePanel', { panelId: 'panel-left' })`

- `panels/setScopeMode` — Set the scope mode for panel-specific operations
  - Payload: `{ mode: string }`
  - Example: `dispatchUiEvent(this, 'panels/setScopeMode', { mode: 'edit' })`

**Authentication Actions** — These manage user authentication state:

- `auth/setUser` — Set the current authenticated user
  - Payload: `{ user: { uid: string, email?: string } | null }`
  - Example: `dispatchUiEvent(this, 'auth/setUser', { user: { uid: '123', email: 'user@example.com' } })`
  - Note: Pass `null` to log out

**Session Actions** — These control application session state:

- `session/reset` — Reset session-specific state (clears errors, panel data, etc.)
  - Payload: `{}`
  - Example: `dispatchUiEvent(this, 'session/reset', {})`

### Core Handler Actions

In addition to the workspace-specific actions above, the framework provides low-level handler actions for advanced use cases. These are typically used by the framework itself rather than by views, but you may occasionally need them:

**State Management Actions:**

- `context/update` — Update a specific path in the state tree
  - Payload: `{ path: string | string[], value: unknown, followUps?: Action[] }`
  - Example: `dispatchUiEvent(this, 'context/update', { path: 'theme.darkMode', value: true })`
  - This is useful for updating nested state properties without replacing entire objects

- `context/patch` — Merge changes into a namespace
  - Payload: `{ namespace: string, changes: object, followUps?: Action[] }`
  - Example: `dispatchUiEvent(this, 'context/patch', { namespace: 'layout', changes: { overlayView: null } })`
  - This shallow-merges the changes object into the specified namespace

- `layout/update` — Update layout state directly
  - Payload: `{ changes: Partial<LayoutState>, followUps?: Action[] }`
  - Example: `dispatchUiEvent(this, 'layout/update', { changes: { viewportWidthMode: 'auto' } })`

- `panels/update` — Update panel state
  - Payload: `{ panels?: Panel[], panelId?: string, changes?: object, followUps?: Action[] }`
  - Example: `dispatchUiEvent(this, 'panels/update', { panelId: 'panel-1', changes: { width: 50 } })`

**Important Note on Follow-Up Actions:**

Many actions support a `followUps` array in their payload. This allows you to specify additional actions that should execute after the current action completes. This is particularly useful for complex workflows that require multiple state changes:

```typescript
dispatchUiEvent(this, 'panels/assignView', {
  viewId: 'editor',
  data: { fileName: 'new-file.ts' },
  followUps: [
    { type: 'layout/setExpansion', payload: { side: 'right', expanded: true } },
    { type: 'panels/selectPanel', payload: { panelId: 'panel-main-1' } }
  ]
});
```

This action will assign a view, then open the right panel, then select a specific panel—all in one atomic operation.

### Creating Custom Handlers for Domain-Specific Actions

While the framework provides many built-in actions, you'll often need custom actions specific to your application's domain. For example, if you're building a document editor, you might want actions like `document/save`, `document/load`, or `document/updateContent`. The framework's handler registry makes it easy to register custom handlers for these domain-specific actions.

**The Handler Pattern:**

A handler is a pure function that takes the current application state and an action object, then returns a new state and optionally any follow-up actions to execute. Here's the signature:

```typescript
type HandlerFunction = (
  state: UIState,
  action: { type: string; payload?: any }
) => {
  state: UIState;
  followUps: Action[];
}
```

Handlers should never mutate the existing state. Instead, they should create and return a new state object with the desired changes applied.

**Registering a Custom Handler:**

To add custom handlers to your application, you register them with the framework's handler registry. This is typically done in your main application setup, before or after calling `bootstrapFramework`:

```typescript
import { frameworkHandlers } from '@project/framework';

// Register a handler for saving documents
frameworkHandlers.register('document/save', (state, action) => {
  const { content, title } = action.payload ?? {};
  
  // Perform the save operation (this could be async, but handlers must be sync)
  console.log('Saving document:', title, content);
  
  // Return unchanged state since we're just triggering a side effect
  // In a real app, you might update a "lastSaved" timestamp
  return {
    state: {
      ...state,
      // Update any relevant state properties
    },
    followUps: [] // No follow-up actions needed
  };
});

// Register a handler for loading a document
frameworkHandlers.register('document/load', (state, action) => {
  const { documentId } = action.payload ?? {};
  
  // In a real application, you'd load the document from storage
  const documentContent = `// Content for document ${documentId}`;
  
  // Return state with follow-up action to assign the view
  return {
    state,
    followUps: [
      {
        type: 'panels/assignView',
        payload: {
          viewId: 'document-editor',
          data: {
            documentId,
            content: documentContent,
            title: `Document ${documentId}`
          }
        }
      }
    ]
  };
});

// Register a handler that updates custom application state
frameworkHandlers.register('app/setTheme', (state, action) => {
  const { theme } = action.payload ?? {};
  
  return {
    state: {
      ...state,
      theme: {
        ...state.theme,
        current: theme,
        lastChanged: Date.now()
      }
    },
    followUps: []
  };
});
```

**Using Custom Handlers from Views:**

Once you've registered custom handlers, views can dispatch actions to them just like built-in framework actions:

```typescript
@customElement('document-view')
export class DocumentView extends LitElement {
  @property() documentId = '';
  @property() content = '';

  private handleSave() {
    dispatchUiEvent(this, 'document/save', {
      documentId: this.documentId,
      content: this.content,
      title: `Document ${this.documentId}`
    });
  }

  private handleLoad(id: string) {
    dispatchUiEvent(this, 'document/load', {
      documentId: id
    });
  }

  render() {
    return html`
      <button @click=${this.handleSave}>Save Document</button>
      <button @click=${() => this.handleLoad('doc-123')}>Load Document</button>
    `;
  }
}
```

**Important Considerations for Custom Handlers:**

**Handlers must be synchronous** — The handler function itself must be synchronous and return immediately. If you need to perform asynchronous operations (like API calls), there are two recommended patterns:

1. Trigger the async operation as a side effect but return immediately:
```typescript
frameworkHandlers.register('data/fetch', (state, action) => {
  // Trigger async operation (don't await it)
  fetchDataAsync(action.payload).then(data => {
    // Dispatch another action when complete
    dispatchUiEvent(window, 'data/fetchComplete', { data });
  });
  
  // Return immediately with loading state
  return {
    state: {
      ...state,
      loading: true
    },
    followUps: []
  };
});

// Register a handler for when the async operation completes
frameworkHandlers.register('data/fetchComplete', (state, action) => {
  return {
    state: {
      ...state,
      loading: false,
      data: action.payload.data
    },
    followUps: []
  };
});
```

2. Handle async operations in your view and only dispatch actions when data is ready:
```typescript
@customElement('data-view')
export class DataView extends LitElement {
  async loadData() {
    const data = await fetchDataAsync();
    dispatchUiEvent(this, 'data/loaded', { data });
  }
}
```

**Handlers should be pure** — Avoid side effects in handlers when possible. The ideal handler only transforms state. If side effects are necessary (like logging, analytics, or triggering async operations), acknowledge that these make the handler impure and may complicate testing.

**State immutability** — Always create new state objects rather than mutating existing ones. Use the spread operator to copy objects and arrays:

```typescript
// Good - creates new objects
return {
  state: {
    ...state,
    layout: {
      ...state.layout,
      overlayView: 'settings'
    }
  },
  followUps: []
};

// Bad - mutates existing state
state.layout.overlayView = 'settings';
return { state, followUps: [] };
```

**Namespace your actions** — Use a domain prefix for your action types to avoid collisions with framework actions or other custom handlers. For example: `document/save`, `app/setTheme`, `user/login`, etc.

**Return empty followUps array** — Always return a `followUps` array, even if it's empty. This maintains consistency with the handler contract.

**Handler Composition for Complex Workflows:**

You can create complex workflows by having handlers return follow-up actions that trigger other handlers:

```typescript
frameworkHandlers.register('workflow/newDocument', (state, action) => {
  return {
    state,
    followUps: [
      // First, create a new document in state
      { type: 'document/create', payload: { title: 'Untitled' } },
      // Then assign it to a panel
      { type: 'panels/assignView', payload: { viewId: 'document-editor' } },
      // Finally, expand the properties panel
      { type: 'layout/setExpansion', payload: { side: 'right', expanded: true } }
    ]
  };
});
```

When you dispatch `workflow/newDocument`, all three follow-up actions execute in sequence, each potentially triggering its own follow-up actions. The framework processes the entire chain before completing the original dispatch.

**Testing Custom Handlers:**

Because handlers are pure functions, they're very easy to unit test:

```typescript
import { describe, it, expect } from 'vitest'; // or your test framework
import { frameworkHandlers } from '@project/framework';

describe('document/save handler', () => {
  it('should save document content', () => {
    const initialState = {
      /* your initial state */
    };
    
    const action = {
      type: 'document/save',
      payload: {
        documentId: 'doc-123',
        content: 'Hello, world!',
        title: 'Test Document'
      }
    };
    
    const handler = frameworkHandlers.get('document/save');
    const result = handler(initialState, action);
    
    expect(result.state).toBeDefined();
    expect(result.followUps).toEqual([]);
    // Add more specific assertions based on your handler's behavior
  });
});
```

This testing approach validates that your handlers correctly transform state without needing to set up the entire framework or render any components

## Registering a View

Once you've written a view component, you need to register it with the framework's view registry. This is typically done in your application's bootstrap code.

### Basic Registration

```typescript
import { ViewRegistry } from '@project/framework';

// Register the view definition
ViewRegistry.register({
  id: 'my-simple-view',              // Unique identifier for this view
  name: 'My Simple View',            // Human-readable name
  title: 'My Simple View',           // Display title
  tag: 'my-simple-view',             // HTML tag name (must match @customElement)
  icon: '🎨',                         // Icon (emoji or icon class name)
  component: () => import('./my-simple-view')  // Lazy-loaded component module
});
```

### Understanding Registration Properties

**The `id` field** — This is a unique string identifier for the view. Use kebab-case (lowercase with hyphens). This ID is used throughout the framework to reference the view.

**The `name` and `title` fields** — These are human-readable labels. They're typically the same but can differ if needed. They appear in the UI when displaying view choices.

**The `tag` field** — This must exactly match the string passed to `@customElement` in your view component. The framework uses this to create instances of your component.

**The `icon` field** — This is required and should be a short visual identifier. You can use:
- Emoji characters: `'🎨'`, `'📊'`, `'⚙️'`
- Icon class names from an icon library (if you're using one): `'codicon-file'`, `'icon-settings'`

**The `component` field** — This is a function that returns a dynamic import. This allows views to be loaded on-demand rather than bundling everything upfront. The function should return `import('./path-to-view-component')`.

### Complete Bootstrap Example

Here's a realistic example showing how to register multiple views when initializing your application:

```typescript
import { bootstrapFramework } from '@project/framework';
import { DEMO_LAYOUT } from './data/demo-layout';

// Lazy-load functions for each view
const loadEditorView = () => import('./views/editor-view');
const loadPreviewView = () => import('./views/preview-view');
const loadPropertiesView = () => import('./views/properties-view');
const loadLibraryView = () => import('./views/library-view');
const loadSettingsView = () => import('./views/settings-view');

// Bootstrap the framework with view registrations
bootstrapFramework({
  views: [
    {
      id: 'editor',
      name: 'Editor',
      title: 'Code Editor',
      tag: 'editor-view',
      icon: '📝',
      component: loadEditorView
    },
    {
      id: 'preview',
      name: 'Preview',
      title: 'Live Preview',
      tag: 'preview-view',
      icon: '👁️',
      component: loadPreviewView
    },
    {
      id: 'properties',
      name: 'Properties',
      title: 'Property Inspector',
      tag: 'properties-view',
      icon: '⚙️',
      component: loadPropertiesView
    },
    {
      id: 'library',
      name: 'Library',
      title: 'Component Library',
      tag: 'library-view',
      icon: '📚',
      component: loadLibraryView
    },
    {
      id: 'settings',
      name: 'Settings',
      title: 'Application Settings',
      tag: 'settings-view',
      icon: '🔧',
      component: loadSettingsView
    }
  ],
  state: DEMO_LAYOUT  // Initial UI state
});
```

### Understanding `bootstrapFramework`

The `bootstrapFramework` function is the main entry point for initializing your application. It:

1. Registers all provided view definitions with the view registry
2. Hydrates the UI state with the provided initial state (if any)
3. Creates and mounts the framework root element in the DOM

**The `views` array** — Each element is a view definition object as described above.

**The `state` property** — This is an optional initial UI state object that defines the starting panel layout, which views are visible, expansion states, etc. If omitted, the framework starts with default empty state.

**The `mount` property** — (Not shown above) You can optionally specify a DOM element to mount the framework into. If omitted, it mounts to `document.body`.

## View File Organization

A typical project structure for views looks like this:

```
src/
  views/
    editor-view.ts          // Editor view component
    preview-view.ts         // Preview view component
    properties-view.ts      // Properties view component
    library-view.ts         // Library view component
    settings-view.ts        // Settings view component
  data/
    demo-layout.ts          // Initial state configuration
  main.ts                   // Bootstrap code
```

Each view file exports a single Lit element component. The main.ts file imports the view registry and registers all views before mounting the application.

## Working with View Data

When the framework assigns a view to a panel, it can pass data to the view instance. Here's how the data flow works:

### How Data Gets to Your View

1. **Initial assignment** — When a view is assigned to a panel (either programmatically or through user interaction), the framework can include a `data` object.

2. **Panel state** — The data is stored in the panel's view object and persists as long as the view is assigned to that panel.

3. **Property application** — The `PanelView` component (which wraps your view) reads the data and applies it to your component's properties.

### Data Application Pattern

The framework follows this pattern when applying data to your view:

```typescript
// This happens inside PanelView when your view is loaded
const view = resolveViewData();  // Gets view data from panel state
const element = document.createElement('your-view-tag');

// If data exists and is an object, extract known properties
if (view.data && typeof view.data === 'object') {
  const viewData = view.data as { label?: unknown; color?: unknown };
  
  // Apply specific properties
  if (typeof viewData.label === 'string') {
    element.label = viewData.label;
  }
  if (typeof viewData.color === 'string') {
    element.color = viewData.color;
  }
  
  // Always set the data object itself
  element.data = view.data;
}
```

### Recommended Data Pattern

Based on this, here's the recommended pattern for your view:

```typescript
@customElement('my-view')
export class MyView extends LitElement {
  // Individual properties with defaults
  @property() label = 'Default Label';
  @property() color = '#eee';
  
  // Data object that can contain anything
  @property({ type: Object }) data: Record<string, unknown> | null = null;

  render() {
    // Prefer data object values over individual property defaults
    const actualLabel = this.data?.label as string ?? this.label;
    const actualColor = this.data?.color as string ?? this.color;
    
    return html`
      <div style="background: ${actualColor}">${actualLabel}</div>
    `;
  }
}
```

This pattern ensures your view works whether data comes through the `data` object or through individual properties.

## Advanced: Programmatic View Assignment with Handlers

The handler-based architecture means that all view assignments flow through the action dispatch system rather than through imperative API calls. This maintains consistency with the rest of the framework and ensures that view assignments are logged, can trigger follow-up actions, and can be replayed for debugging.

When you need to assign a view to a panel programmatically with specific data, you dispatch a `panels/assignView` action. The framework's handler will look up the view definition, create an instance, apply the data, and assign it to the specified panel:

```typescript
import { dispatchUiEvent } from '@project/framework';

// Assign a view with custom data to a specific panel
function openEditorWithFile(fileName: string, content: string) {
  dispatchUiEvent(window, 'panels/assignView', {
    viewId: 'document-editor',
    panelId: 'panel-main-1',  // Optional - omit to use currently selected panel
    data: {
      title: fileName,
      content: content,
      lastModified: Date.now()
    }
  });
}

// Example usage
openEditorWithFile('main.ts', 'console.log("Hello, world!");');
```

**How the handler processes this action:**

When you dispatch `panels/assignView`, the framework's `FrameworkRoot` component catches the event and routes it through its internal workspace action handler. Here's what happens step by step:

1. The action is received with type `panels/assignView` and the payload containing `viewId`, optional `panelId`, and optional `data`
2. The handler determines which panel to use (the specified `panelId` or the currently selected panel from state)
3. It calls `viewRegistry.createView(viewId, data)` which creates a new view object with the data attached
4. The new view object is assigned to the panel's `view` property
5. The `viewId` and `activeViewId` are set on the panel
6. The view is added to the global views array (if not already present)
7. The main view order is recalculated to reflect the new assignment
8. The state is updated, triggering re-renders throughout the framework

**Creating workflows with follow-up actions:**

One of the powerful features of the handler architecture is that you can create multi-step workflows by chaining actions together. For example, you might want to open a document, expand the properties panel, and set the viewport to show multiple panels:

```typescript
function openDocumentWorkflow(documentId: string, content: string) {
  dispatchUiEvent(window, 'panels/assignView', {
    viewId: 'document-editor',
    data: {
      documentId,
      content,
      title: `Document ${documentId}`
    },
    followUps: [
      // After assigning the view, expand the right panel
      {
        type: 'layout/setExpansion',
        payload: { side: 'right', expanded: true }
      },
      // And set viewport to show 2 panels
      {
        type: 'layout/setViewportWidthMode',
        payload: { mode: '2x' }
      }
    ]
  });
}
```

This executes as a single atomic operation. The framework processes the main action, then processes each follow-up action in sequence. If any follow-up action returns its own follow-up actions, those are added to the queue and processed in order.

**Using custom handlers to orchestrate complex operations:**

For truly complex workflows, you can register a custom handler that orchestrates the entire sequence:

```typescript
import { frameworkHandlers } from '@project/framework';

frameworkHandlers.register('workflow/openDocument', (state, action) => {
  const { documentId, splitView } = action.payload ?? {};
  
  // Build a sequence of follow-up actions based on the workflow requirements
  const followUps = [
    // First, assign the document editor
    {
      type: 'panels/assignView',
      payload: {
        viewId: 'document-editor',
        panelId: 'panel-main-1',
        data: { documentId }
      }
    }
  ];
  
  // If split view is requested, assign a preview to the second panel
  if (splitView) {
    followUps.push({
      type: 'panels/assignView',
      payload: {
        viewId: 'document-preview',
        panelId: 'panel-main-2',
        data: { documentId }
      }
    });
    followUps.push({
      type: 'layout/setViewportWidthMode',
      payload: { mode: '2x' }
    });
  }
  
  // Always expand the properties panel for document editing
  followUps.push({
    type: 'layout/setExpansion',
    payload: { side: 'right', expanded: true }
  });
  
  // Return unchanged state with the workflow as follow-up actions
  return {
    state,
    followUps
  };
});
```

Then from your view or anywhere in the application, you can trigger this workflow:

```typescript
// Open document in split-view mode
dispatchUiEvent(window, 'workflow/openDocument', {
  documentId: 'doc-123',
  splitView: true
});
```

This approach keeps the complex workflow logic centralized in a handler rather than scattered throughout your view components. The handler becomes the single source of truth for how the "open document" workflow should behave, making it easier to maintain and test.

**Testing programmatic view assignments:**

Because everything flows through handlers, testing view assignment workflows is straightforward. You can test the handler in isolation:

```typescript
import { frameworkHandlers } from '@project/framework';

describe('workflow/openDocument handler', () => {
  it('should assign editor and preview in split view mode', () => {
    const initialState = {
      panels: [
        { id: 'panel-main-1', region: 'main' },
        { id: 'panel-main-2', region: 'main' }
      ],
      // ... rest of initial state
    };
    
    const action = {
      type: 'workflow/openDocument',
      payload: {
        documentId: 'doc-123',
        splitView: true
      }
    };
    
    const handler = frameworkHandlers.get('workflow/openDocument');
    const result = handler(initialState, action);
    
    // Verify the follow-up actions
    expect(result.followUps).toHaveLength(4);
    expect(result.followUps[0].type).toBe('panels/assignView');
    expect(result.followUps[0].payload.viewId).toBe('document-editor');
    expect(result.followUps[1].type).toBe('panels/assignView');
    expect(result.followUps[1].payload.viewId).toBe('document-preview');
    expect(result.followUps[2].type).toBe('layout/setViewportWidthMode');
    expect(result.followUps[3].type).toBe('layout/setExpansion');
  });
});
```

This testing approach validates the workflow logic without needing to mount components or interact with the DOM

## Complete Example: A Full-Featured View with Custom Handlers

Here's a complete example that demonstrates all the concepts together, including custom handler registration for domain-specific actions:

**First, register the custom handlers (in your main.ts or bootstrap file):**

```typescript
import { frameworkHandlers, bootstrapFramework } from '@project/framework';

// Register handler for document save operations
frameworkHandlers.register('document/save', (state, action) => {
  const { title, content, timestamp } = action.payload ?? {};
  
  // In a real app, you'd persist to a database or file system here
  console.log('Saving document:', { title, content, timestamp });
  
  // Could update state with last saved time
  return {
    state: {
      ...state,
      // You might have a documents collection in state
      // documents: updateDocument(state.documents, { title, content, timestamp })
    },
    followUps: []
  };
});

// Register handler for document operations that need to update UI
frameworkHandlers.register('document/saveComplete', (state, action) => {
  const { success, error } = action.payload ?? {};
  
  return {
    state,
    followUps: success
      ? [{ type: 'session/clearErrors', payload: {} }]
      : [{ type: 'session/setError', payload: { error } }]
  };
});

// Continue with bootstrap...
bootstrapFramework({
  views: [/* your view definitions */],
  state: {/* initial state */}
});
```

**Then, create the view component:**

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext, type UiStateContextValue, dispatchUiEvent } from '@project/framework';

interface DocumentData {
  title?: string;
  content?: string;
  lastModified?: number;
}

@customElement('document-editor')
export class DocumentEditor extends LitElement {
  // Public properties (can be set from outside)
  @property() title = 'Untitled Document';
  @property({ type: Object }) data: DocumentData | null = null;

  // Internal state (private to this component)
  @state() private content = '';
  @state() private isDirty = false;

  // Framework state via context
  private uiState: UiStateContextValue['state'] | null = null;
  private uiStateConsumer = new ContextConsumer(this, {
    context: uiStateContext,
    subscribe: true,
    callback: (value: UiStateContextValue | undefined) => {
      this.uiState = value?.state ?? null;
      this.requestUpdate();
    },
  });

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #1e1e1e;
      color: #d4d4d4;
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: #2d2d2d;
      border-bottom: 1px solid #3e3e3e;
    }
    .title {
      flex: 1;
      font-size: 14px;
      font-weight: 600;
    }
    .status {
      font-size: 12px;
      opacity: 0.7;
    }
    button {
      padding: 4px 12px;
      border-radius: 4px;
      border: 1px solid #444;
      background: #333;
      color: #d4d4d4;
      cursor: pointer;
      font-size: 12px;
    }
    button:hover {
      background: #404040;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .editor {
      flex: 1;
      padding: 16px;
      overflow: auto;
    }
    textarea {
      width: 100%;
      height: 100%;
      background: transparent;
      color: inherit;
      border: none;
      outline: none;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 14px;
      line-height: 1.6;
      resize: none;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    
    // Load data if provided through the data property
    if (this.data) {
      this.title = this.data.title ?? this.title;
      this.content = this.data.content ?? '';
    }
  }

  private handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.content = target.value;
    this.isDirty = true;
  }

  private handleSave() {
    // Dispatch to custom handler - this goes through the handler registry
    dispatchUiEvent(this, 'document/save', {
      title: this.title,
      content: this.content,
      timestamp: Date.now()
    });
    
    // The handler executes synchronously, so we can immediately update local state
    this.isDirty = false;
  }

  private handleClose() {
    // Dispatch to built-in framework handler to close the overlay
    dispatchUiEvent(this, 'layout/setOverlayView', { viewId: null });
  }

  private handleExpandProperties() {
    // Dispatch to built-in framework handler to expand the right panel
    dispatchUiEvent(this, 'layout/setExpansion', {
      side: 'right',
      expanded: true
    });
  }

  render() {
    // Access framework state through context
    const auth = this.uiState?.auth;
    const userEmail = auth?.user?.email ?? 'Guest';
    const isLoggedIn = auth?.isLoggedIn ?? false;

    return html`
      <div class="toolbar">
        <div class="title">${this.title}</div>
        <div class="status">
          ${this.isDirty ? 'Modified' : 'Saved'} • ${userEmail}
        </div>
        <button 
          @click=${this.handleSave} 
          ?disabled=${!this.isDirty || !isLoggedIn}
          title=${isLoggedIn ? 'Save document' : 'Login required to save'}
        >
          Save
        </button>
        <button @click=${this.handleExpandProperties}>
          Properties
        </button>
        <button @click=${this.handleClose}>Close</button>
      </div>
      <div class="editor">
        <textarea
          .value=${this.content}
          @input=${this.handleInput}
          placeholder="Start typing..."
          ?disabled=${!isLoggedIn}
        ></textarea>
      </div>
    `;
  }
}
```

**Register the view:**

```typescript
import { ViewRegistry } from '@project/framework';

ViewRegistry.register({
  id: 'document-editor',
  name: 'Document Editor',
  title: 'Document Editor',
  tag: 'document-editor',
  icon: '📝',
  component: () => import('./views/document-editor')
});
```

**Using the view with custom data:**

```typescript
// From another view or component, you can assign this view with data
dispatchUiEvent(window, 'panels/assignView', {
  viewId: 'document-editor',
  panelId: 'panel-main-1',
  data: {
    title: 'My Document',
    content: '// Start coding here...',
    lastModified: Date.now()
  }
});
```

This example demonstrates:

- **Custom handler registration** for domain-specific actions (`document/save`)
- **Built-in handler usage** for framework actions (`layout/setOverlayView`, `layout/setExpansion`)
- **Context consumption** to access framework state (authentication status, user info)
- **Property-based data** passed through the panel system
- **State management** with both reactive properties (`@property`) and internal state (`@state`)
- **Conditional UI** based on framework state (disable save when not logged in)
- **Handler-based communication** as the only way to mutate application state

The key insight is that everything flows through the handler registry. Whether it's a custom domain action like `document/save` or a built-in framework action like `layout/setExpansion`, all state mutations go through registered handlers. This creates a predictable, testable, and maintainable architecture where every state change is explicit and traceable

## Testing Your View

Before integrating a view into the full framework, you can test it standalone:

```html
<!DOCTYPE html>
<html>
<head>
  <title>View Test</title>
  <style>
    body { margin: 0; padding: 0; height: 100vh; }
    document-editor { height: 100%; }
  </style>
</head>
<body>
  <document-editor
    title="Test Document"
  ></document-editor>
  <script type="module" src="./views/document-editor.js"></script>
</body>
</html>
```

This lets you iterate on the view's UI and behavior without dealing with the full framework complexity.

## Common Patterns and Tips

### Responsive Sizing

Always ensure your view fills its container:

```css
:host {
  display: block;
  width: 100%;
  height: 100%;
}
```

### Handling Overflow

For content that may exceed the panel bounds:

```css
:host {
  display: block;
  width: 100%;
  height: 100%;
  overflow: auto;  /* or hidden, or scroll */
}
```

### Dark Theme Colors

The framework uses a dark theme. Use these colors for consistency:

```css
/* Background colors */
--bg-primary: #0f172a;
--bg-secondary: #111827;
--bg-tertiary: #1f2937;

/* Border colors */
--border: #374151;
--border-light: #4b5563;

/* Text colors */
--text-primary: #e5e7eb;
--text-secondary: #9ca3af;
--text-tertiary: #6b7280;
```

### Loading States

Show loading indicators for async operations:

```typescript
@state() private isLoading = false;

async loadData() {
  this.isLoading = true;
  try {
    const data = await fetchData();
    this.content = data;
  } finally {
    this.isLoading = false;
  }
}

render() {
  if (this.isLoading) {
    return html`<div>Loading...</div>`;
  }
  // ... normal render
}
```

### Error Handling

Display errors gracefully:

```typescript
@state() private error: string | null = null;

render() {
  if (this.error) {
    return html`
      <div style="color: #ef4444; padding: 16px;">
        Error: ${this.error}
      </div>
    `;
  }
  // ... normal render
}
```

## Troubleshooting

### View Not Appearing

**Problem:** Registered a view but it doesn't show up in panels.

**Solutions:**
- Verify the `id` in your registration matches the `viewId` in your state/panel configuration
- Check that the `tag` exactly matches the `@customElement` decorator string
- Ensure the component module is actually exported
- Look for console errors during lazy loading

### Data Not Updating

**Problem:** Properties change but the view doesn't re-render.

**Solutions:**
- Ensure you're using `@property()` decorator, not plain class properties
- For object/array properties, you must create new references: `this.data = { ...this.data, newField: value }`
- Call `this.requestUpdate()` manually if needed

### Context Not Available

**Problem:** `uiState` is always null in your view.

**Solutions:**
- Ensure your view is rendered inside the `framework-root` element
- Verify you're using `ContextConsumer` correctly with `subscribe: true`
- Check that you're storing the state in a local property in the callback

### Styling Not Applied

**Problem:** CSS doesn't seem to affect the view.

**Solutions:**
- Make sure styles are in a `static styles` property, not `static style` or instance property
- Remember shadow DOM boundaries — global styles won't affect your component
- Use `:host` to style the component root element itself

## Summary

To create and use a view in the framework, you follow this workflow:

**Write a Lit element** with the `@customElement` decorator and a unique tag name. This creates a web component that can be rendered inside framework panels.

**Add properties** using `@property()` to accept configuration data. The framework convention is to support both individual properties (for standalone usage) and a `data` property (for framework-managed data passing).

**Access framework state** using `ContextConsumer` and `uiStateContext` when your view needs to read workspace state, authentication information, or other framework-level data. The context consumer automatically re-renders your view when relevant state changes.

**Dispatch actions through the handler registry** using `dispatchUiEvent` whenever your view needs to communicate with the framework or trigger state changes. This is the only way to mutate application state, ensuring all changes flow through a predictable, testable pathway.

**Register custom handlers** for domain-specific actions using `frameworkHandlers.register()`. Handlers are pure functions that receive the current state and an action, then return new state and optional follow-up actions. This creates a clean separation between your view's presentation logic and your application's business logic.

**Register the view definition** using `ViewRegistry.register()` with a unique ID, human-readable name, HTML tag, icon, and lazy-load function. This makes the view available to the framework's panel system.

**Bootstrap your application** with `bootstrapFramework()`, passing all view definitions and optional initial state. The bootstrap process registers all views with the registry, hydrates the initial state, and mounts the framework root element in the DOM.

The key architectural principle is that the framework uses a unidirectional data flow with centralized state management. Views observe state through context and dispatch actions to request changes. All state mutations flow through registered handlers in the handler registry. This creates a predictable, maintainable architecture where every state change is explicit, logged, and testable. The framework handles creating view instances, managing their lifecycle, and rendering them in panels. Your view component focuses on rendering content based on its properties and dispatching actions to communicate intent. The handlers translate those intentions into concrete state changes, keeping your views simple and your business logic centralized.