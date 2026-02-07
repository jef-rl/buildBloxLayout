# Task 0032 — Purify Reducers

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
Remove impurity from reducers.

## Scope
- packages/framework/nxt/reducers/**

## Steps
1. Remove Date/random usage.
2. No registry imports.

## DoD
- Build passes
