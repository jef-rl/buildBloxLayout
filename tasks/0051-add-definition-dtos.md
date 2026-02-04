# Task 0051 — Add Definition Dtos

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
Create serializable DTOs.

## Scope
- src/nxt/definitions/dto/*

## Steps
1. Add ActionDef, HandlerDef, EffectDef, ViewDef.

## DoD
- Build passes
