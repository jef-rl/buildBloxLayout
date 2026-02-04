    export interface HandlerDefDto {
      id: string;                  // e.g. "handler:layout/setExpansion"
      action: string;              // e.g. "layout/setExpansion"
      implKey: string;             // e.g. "reducer:layout/setExpansion@1"
      description?: string;
      config?: Record<string, unknown>;
    }
  