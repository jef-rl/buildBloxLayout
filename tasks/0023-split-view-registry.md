# Task 0023 — Split View Registry

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
Separate view definitions from runtime caching.

## Scope
- src/core/registry/view-registry.ts

## Steps
1. Create definition registry.
2. Create runtime loader.
3. Shim old API.

## DoD
- Build passes
