    export interface SelectorRefDto {
      kind: 'path' | 'fnRef';
      path?: string;
      ref?: string;
    }

    export interface ViewDefDto {
      id: string;                  // "view:firebase-auth"
      tagName: string;             // "auth-view"
      implKey?: string;            // "component:auth-view@1"
      defaultSelector?: SelectorRefDto;
      defaultSettings?: Record<string, unknown>;
      description?: string;
    }
  