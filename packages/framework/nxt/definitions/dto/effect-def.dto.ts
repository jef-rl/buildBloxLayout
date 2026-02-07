    export interface EffectDefDto {
      id: string;                  // e.g. "effect:presets/hydrate"
      forAction: string;           // e.g. "presets/hydrate"
      implKey: string;             // e.g. "effect:presets/hydrate@1"
      description?: string;
      config?: Record<string, unknown>;
    }
  