import type { UIState } from '../../../src/types/state';

export type FrameworkState = Omit<UIState, 'viewTokens'>;
