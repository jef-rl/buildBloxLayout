# BuildBlox Layout

## Framework Integration

Use the framework package to register view components, hydrate layout state, and wire UI actions into the layout system.

### Register views with `viewRegistry.register`

The playground registers each view (id, name, tag, and lazy-loaded component) before any layout state is loaded. This ensures the registry can resolve view ids as panels render.

```ts
// packages/playground/src/main.ts
import { uiState, viewRegistry as ViewRegistry } from '@project/framework';
import { DEMO_LAYOUT } from './data/demo-layout';

const loadSimpleView = () => import('./components/simple-view');

DEMO_LAYOUT.views.forEach((view) => {
  ViewRegistry.register({
    id: view.id,
    name: view.name,
    title: view.name,
    tag: 'simple-view',
    component: loadSimpleView
  });
});
```

### Provide layout data via `uiState.update`

Once the views are registered, initialize the UI store with layout data (panels, layout regions, view ids, and metadata).

```ts
// packages/playground/src/main.ts
uiState.update(DEMO_LAYOUT);
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
