# Task 0053 — Refresh CoreContext on State Updates

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
Ensure CoreContext consumers re-render when UI state updates.

## Scope
- packages/framework/nxt/runtime/context/core-context.ts
- packages/framework/nxt/runtime/context/core-context-key.ts
- tasks/0053-fix-core-context-refresh.md

## Steps
1. Refresh the CoreContext provider value alongside the UI context updates.

## DoD
- Build passes
