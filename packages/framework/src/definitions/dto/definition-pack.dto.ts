    import type { ActionDefDto } from './action-def.dto';
    import type { HandlerDefDto } from './handler-def.dto';
    import type { EffectDefDto } from './effect-def.dto';
    import type { ViewDefDto } from './view-def.dto';
    import type { SelectorDefDto } from './selector-def.dto';

    export interface DefinitionPackDto {
      id: string;
      version: string;
      actions?: ActionDefDto[];
      handlers?: HandlerDefDto[];
      effects?: EffectDefDto[];
      views?: ViewDefDto[];
      selectors?: SelectorDefDto[];
    }
  