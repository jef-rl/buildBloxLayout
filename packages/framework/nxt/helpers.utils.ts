// Generic helper utilities
// Dock-specific utilities have been moved to domains/dock/utils.ts

// Re-export dock utilities for backward compatibility
export { getPosClasses, getPickerStyles, getArrowStyles, gridIndexToPos } from './dock.utils'

const FRAMEWORK_ADMIN_EMAILS_RAW = 'your-admin@example.com';

export const FRAMEWORK_ADMIN_EMAILS: string[] = FRAMEWORK_ADMIN_EMAILS_RAW
  .split(',')
  .map(e => e.trim())
  .filter(Boolean);
