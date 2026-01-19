# BuildBlox Layout

## Framework Integration

Use the framework package to register view components, hydrate layout state, and wire UI actions into the layout system.

### Bootstrap with `bootstrapFramework`

The playground registers each view (id, name, tag, and lazy-loaded component), hydrates the layout state, and mounts the framework root in one call. This ensures the registry can resolve view ids as panels render.

```ts
// packages/playground/src/main.ts
import { bootstrapFramework } from '@project/framework';
import { DEMO_LAYOUT } from './data/demo-layout';

const loadSimpleView = () => import('./components/simple-view');

bootstrapFramework({
  views: DEMO_LAYOUT.views.map((view) => ({
    id: view.id,
    name: view.name,
    title: view.name,
    tag: 'simple-view',
    component: loadSimpleView
  })),
  state: DEMO_LAYOUT
});
```

### Dispatch UI actions with `dispatchUiEvent`

Views and controls dispatch workspace actions through the shared `ui-event` channel. The framework provides a utility for emitting a typed event with a payload.

```ts
// packages/framework/src/utils/dispatcher.ts
export const dispatchUiEvent = <TPayload>(target: UiEventTarget, type: string, payload?: TPayload) => {
  const detail: UiEventDetail = { type, payload };
  target.dispatchEvent(new CustomEvent('ui-event', { detail, bubbles: true, composed: true }));
};
```

The root workspace listens for `ui-event` messages and routes them into the layout reducer logic.

```ts
// packages/framework/src/components/layout/WorkspaceRoot.ts
window.addEventListener('ui-event', this.handleUiEvent as EventListener);
```

#### UI event contract

`ui-event` messages always emit a `detail` payload that conforms to the framework's contract:

```ts
export interface UiEventDetail {
  type: string;
  payload: any;
}
```

Use the `type` string to route the UI action and include any structured data on `payload`.

### Access state and dispatch via context

Framework-rooted components can read the UI state and dispatch actions through the exported context. Use `uiStateContext` with a `ContextConsumer` to pull the latest `state` and `dispatch` values.

```ts
import { ContextConsumer } from '@project/framework';
import { uiStateContext, type UiStateContextValue } from '@project/framework';

const consumer = new ContextConsumer(host, {
  context: uiStateContext,
  subscribe: true,
  callback: (value?: UiStateContextValue) => {
    if (!value) return;
    const { state, dispatch } = value;
    dispatch({ type: 'layout/setOverlayView', viewId: state.activeView });
  },
});
```

The context payload always contains the current `state` snapshot plus a `dispatch` function that routes actions through the framework handler registry.

#### Framework logging hook

Integrators can supply a custom logging implementation for framework-level logging hooks.

```ts
import { setFrameworkLogger } from '@project/framework';

setFrameworkLogger({
  info: (message, context) => {
    console.log('[framework]', message, context);
  }
});
```

### Enable overlay views with `layout/setOverlayView`

Overlay panels are driven by the `layout.overlayView` state. Dispatch the `layout/setOverlayView` action (with a `viewId` or `null`) to toggle overlays, and the workspace will render the overlay expander when a view id is present.

```ts
// packages/framework/src/components/layout/WorkspaceRoot.ts
const overlayView = layout.overlayView ?? null;

return html`
  ${overlayView ? html`
    <overlay-expander .viewId="${overlayView}"></overlay-expander>
  ` : nothing}
`;
```

### Demo setup (`packages/playground`)

1. Install dependencies from the repo root:

   ```bash
   npm install
   ```

2. Run the playground workspace:

   ```bash
   npm run --workspace @project/playground dev
   ```

3. Open the Vite dev server URL printed in the terminal to see the sample layout and registered views.
