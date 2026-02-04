# Task 0012 — Extract Legacy Dispatch Engine

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
Move dispatch loop into engine module.

## Scope
- src/components/FrameworkRoot.ts
- src/nxt/runtime/engine/dispatch/legacy-dispatch-engine.ts (new)

## Steps
1. Move dispatch loop logic.
2. FrameworkRoot becomes thin wrapper.

## DoD
- Build passes
