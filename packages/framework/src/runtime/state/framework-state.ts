import type { UIState } from '../../types/state';

export type FrameworkState = Omit<UIState, 'viewTokens'>;
