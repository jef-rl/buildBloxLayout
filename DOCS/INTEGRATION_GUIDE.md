# Integration Guide

This guide covers the minimum you need to integrate views and handlers into the framework. It avoids internal framework details and focuses only on the supported integration surface.

## 1) Register Views

Register views at startup with `bootstrapFramework`. Each view needs a stable `id`, a custom element `tag`, and a lazy `component` loader.

```typescript
import { bootstrapFramework } from '@project/framework';

bootstrapFramework({
  views: [
    {
      id: 'document-editor',
      name: 'Document Editor',
      title: 'Document Editor',
      tag: 'document-editor',
      icon: 'edit',
      component: () => import('./views/document-editor')
    }
  ],
});
```

## 2) Read State (Context Only)

Views consume read-only state via `uiStateContext`. Treat it as immutable.

```typescript
import { ContextConsumer } from '@lit/context';
import { uiStateContext, type UiStateContextValue } from '@project/framework';

private uiState: UiStateContextValue['state'] | null = null;
private uiStateConsumer = new ContextConsumer(this, {
  context: uiStateContext,
  subscribe: true,
  callback: (value: UiStateContextValue | undefined) => {
    this.uiState = value?.state ?? null;
    this.requestUpdate();
  },
});
```

## 3) Dispatch Actions (Never Mutate)

All state changes flow through actions. Views must dispatch actions instead of mutating state.

```typescript
import { dispatchUiEvent } from '@project/framework';

dispatchUiEvent(this, 'layout/setExpansion', { side: 'right', expanded: true });
```

## 4) Add App Handlers (Pure Functions Only)

Register handlers for your domain actions. Handlers must be synchronous, pure, and return new state plus optional follow-ups.

```typescript
import { frameworkHandlers } from '@project/framework';

frameworkHandlers.register('document/save', (state, action) => {
  const payload = action.payload ?? {};
  return {
    state: {
      ...state,
      documents: {
        ...(state as any).documents,
        lastSavedAt: payload.timestamp,
      },
    },
    followUps: [],
  };
});
```

## 5) Optional Logging

If you want centralized logging in the built-in log view, dispatch `logs/append`.

```typescript
dispatchUiEvent(this, 'logs/append', {
  level: 'info',
  message: 'Document saved',
  data: { id: 'doc-123' },
  source: 'document-editor'
});
```

## Integration Rules (Non-Negotiable)

- Views are presentation only; no direct state mutation.
- State is read-only in views; use `dispatchUiEvent` for changes.
- Handlers are pure and synchronous; no I/O or async in reducers.
- Use immutable updates; never modify objects in place.

## Checklist

- [ ] Views registered in `bootstrapFramework`
- [ ] Views consume state via `uiStateContext`
- [ ] Views dispatch actions via `dispatchUiEvent`
- [ ] Handlers registered for custom actions
- [ ] Handlers return `{ state, followUps }` with immutable updates
- [ ] Optional: logs dispatched via `logs/append`
