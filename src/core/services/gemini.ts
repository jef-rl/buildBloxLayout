function env(name: string, fallback = ''): string {
  return (import.meta as any).env?.[name] ?? fallback;
}

export class GeminiClient {
  private apiKey = env('VITE_GEMINI_API_KEY', '');
  private model = env('VITE_GEMINI_MODEL', 'gemini-2.5-flash-preview-09-2025');

  hasKey() {
    return !!this.apiKey;
  }

  async generateText(prompt: string): Promise<string> {
    if (!this.apiKey) throw new Error('Missing VITE_GEMINI_API_KEY');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    const delays = [1000, 2000, 4000];
    for (let i = 0; i <= delays.length; i++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const msg = body?.error?.message || `Gemini API Error: ${res.status}`;
          throw new Error(msg);
        }

        const data = await res.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      } catch (e) {
        if (i === delays.length) throw e;
        await new Promise((r) => setTimeout(r, delays[i]));
      }
    }

    return '';
  }
}
