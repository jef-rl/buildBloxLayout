# Task 0041 — Migrate Workspace Root View

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
WorkspaceRoot uses CoreContext only.

## Scope
- src/domains/workspace/components/WorkspaceRoot.ts

## Steps
1. Consume CoreContext.
2. Remove uiState singleton usage.

## DoD
- Build passes
