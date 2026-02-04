# Task 0006 — Add Action Adapters

## Migration Rules (Must Be Obeyed)

**R0 — Shim rule**
When moving or splitting a file, leave a same-path shim that only re-exports from the new location.
No logic in shims.

**R1 — Single purpose**
Each new file must have exactly one responsibility.
`index.ts` files are re-export only.

**R2 — Build gate**
This task is complete only if `npm run build` passes.

## Goal
Provide adapters from legacy payloads to canonical Action.

## Scope
- src/nxt/runtime/actions/adapters/* (new)

## Steps
1. Add adapter from UiEventDetail -> Action
2. Add adapter from UiDispatchPayload -> Action
3. Add adapter from Action -> legacy HandlerAction

## DoD
- No runtime behavior change
- Build passes
