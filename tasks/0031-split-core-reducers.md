# Task 0031 — Split Core Reducers

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
One reducer per file.

## Scope
- src/core/registry/handler-registry.ts

## Steps
1. Extract each reducer to its own file.
2. Create reducer index mapping.

## DoD
- Build passes
