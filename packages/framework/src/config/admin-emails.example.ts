/**
 * Framework-Level System Administrator Emails
 *
 * Comma-separated list of email addresses granted system administrator
 * privileges across ALL implementations of the framework.
 *
 * Format: Same as VITE_ADMIN_EMAILS in implementation .env files
 * Example: 'admin@example.com,admin2@example.com'
 *
 * SETUP: Copy this file to admin-emails.ts and replace the placeholder below.
 *   cp admin-emails.example.ts admin-emails.ts
 */
const FRAMEWORK_ADMIN_EMAILS_RAW = 'your-admin@example.com';

export const FRAMEWORK_ADMIN_EMAILS: string[] = FRAMEWORK_ADMIN_EMAILS_RAW
  .split(',')
  .map(e => e.trim())
  .filter(Boolean);
