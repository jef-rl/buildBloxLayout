# Task 0054 — Fix View Host Selector Escaping

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
Prevent invalid selectors when view instance IDs contain special characters.

## Scope
- packages/framework/src/nxt/views/host/view-host.ts
- tasks/0054-fix-view-host-selector.md

## Steps
1. Escape instance IDs used in selector queries.

## DoD
- Build passes
