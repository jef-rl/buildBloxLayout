import { blockDataContext, editorContext, uiDispatchContext, uiStateContext } from '../../core/state/contexts.ts';

/**
 * Shared context re-exports for component-level consumers.
 *
 * By funnelling every consumer through the same definitions we keep
 * a single source of truth for UI + editor data and avoid accidental
 * context forks that break one-way data flow.
 */
export {
  blockDataContext,
  editorContext,
  uiDispatchContext,
  uiStateContext,
};

