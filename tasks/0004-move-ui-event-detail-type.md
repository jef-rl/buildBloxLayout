# Task 0004 — Move Ui Event Detail Type

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
Isolate legacy UI event detail type.

## Scope
- src/components/UiEventDetail.type.ts

## Steps
1. Move to `src/nxt/compat/legacy-events/ui-event-detail.ts`
2. Leave shim at original path.

## DoD
- Build passes
