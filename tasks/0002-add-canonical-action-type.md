# Task 0002 — Add Canonical Action Type

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
Introduce the canonical `{ action, payload }` contract.

## Scope
- packages/framework/nxt/runtime/actions/action.ts (new)
- packages/framework/nxt/runtime/index.ts
- packages/framework/nxt/index.ts

## Steps
1. Create `ActionName` and `Action` interface.
2. Export via runtime and root index files.

## DoD
- Build passes
- No existing dispatch logic modified
