# Task 0003 — Move Handleraction Type To Compat

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
Isolate legacy HandlerAction type.

## Scope
- src/core/registry/HandlerAction.type.ts

## Steps
1. Move file to `src/nxt/compat/legacy-actions/handler-action.ts`
2. Leave shim at original path.

## DoD
- All imports still resolve
- Build passes
