# Task 0009 — Extract Create Log Action

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
Isolate createLogAction helper.

## Scope
- src/components/createLogAction.helper.ts

## Steps
1. Move to `src/nxt/runtime/engine/logging/create-log-action.ts`
2. Leave shim.

## DoD
- Build passes
