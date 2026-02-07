# Task 0042 — Introduce View Host

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
Centralize DOM lifecycle for views.

## Scope
- packages/framework/nxt/views/host/view-host.ts (new)

## Steps
1. Create view host.
2. Remove DOM caching from registries.

## DoD
- Build passes
