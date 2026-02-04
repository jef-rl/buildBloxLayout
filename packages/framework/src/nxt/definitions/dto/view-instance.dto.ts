    import type { SelectorRefDto } from './view-def.dto';

    export interface ViewInstanceDto {
      instanceId: string;
      viewId: string;
      selector?: SelectorRefDto;
      settings?: Record<string, unknown>;
      layout?: Record<string, unknown>;
    }
  