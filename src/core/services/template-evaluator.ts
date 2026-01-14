export function safeStringify(value: unknown, spaces = 2): string {
  try {
    return JSON.stringify(value, null, spaces);
  } catch {
    return '{}';
  }
}

/**
 * Evaluates a JS template-string *as authored by the user*.
 * This is intentionally permissive (and therefore unsafe for untrusted inputs).
 * Treat it like an in-browser scratchpad.
 */
export function evaluateTemplate(
  template: string,
  scope: Record<string, any>
): { html: string; error: string } {
  try {
    const keys = Object.keys(scope);
    const values = Object.values(scope);
    const fn = new Function(...keys, `return \`${template}\`;`) as (...args: any[]) => any;
    const out = fn(...values);
    return { html: String(out ?? ''), error: '' };
  } catch (err) {
    return { html: '', error: (err as Error).message || String(err) };
  }
}

export function parseScopeJson(jsonText: string): { scope: Record<string, any>; error: string } {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      // Allow arrays too, but normalize to object wrapper for variable access.
      return { scope: { value: parsed }, error: '' };
    }
    return { scope: parsed as Record<string, any>, error: '' };
  } catch (err) {
    return { scope: {}, error: (err as Error).message || String(err) };
  }
}
