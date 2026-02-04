# Task 0011 — Extract Dispatch Queue

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
Isolate dispatch queue mechanics.

## Scope
- src/components/FrameworkRoot.ts
- src/nxt/runtime/engine/dispatch/dispatch-queue.ts (new)

## Steps
1. Extract queue logic into new file.
2. FrameworkRoot delegates queue ops.

## DoD
- Build passes
