# AGENTS.md

This repository is migrating to a definition-driven framework. Codex MUST follow these non-negotiables when working on tasks.

## Architectural rules (non-negotiable)

1. **Definitions are serializable (data-only).**
   - No functions, class instances, or DOM references inside definition DTOs.

2. **Registries are runtime-only.**
   - Registries may store runtime implementations (reducers/effects/component loaders) but must not store DOM elements.
   - Do not cache Lit elements inside registries.

3. **Reducers (handlers) are pure.**
   - No IO, no timers, no randomness, no `Date.now()`, no registry calls, no DOM.
   - Reducers must return new state (immutable updates). No in-place mutation.

4. **Effects are optional and isolated.**
   - Effects may do IO and async work and may dispatch actions.
   - Effects must not mutate state directly.

5. **Views are presenters only.**
   - Views may select state via registered selectors and may dispatch actions.
   - Views must not import persistence/IO utilities.

6. **Single CoreContext via `@lit/context`.**
   - State and dispatch are provided via a single CoreContext context key.

## Migration rules (non-negotiable)

A. **Shim rule:** when moving or splitting a file, leave a same-path shim that only re-exports from the new location.

B. **Granularity rule:** each new file must have a single purpose:
   - one reducer, one effect, one registry, one DTO, one adapter, etc.
   - `index.ts` files are allowed ONLY for re-exports (no logic).

C. **Scope rule:** for each task, ONLY edit files listed in the task prompt file.

D. **Build gate:** every task MUST keep the framework buildable.
   - default: `npm run build`
   - if your repo uses a different build command, update the workflow inputs or task file.

## Recommended commands

- Install: `npm ci`
- Build: `npm run build`
