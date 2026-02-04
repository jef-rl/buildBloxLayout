    export interface ActionDefDto {
      /** Unique id and canonical action name, e.g. "layout/setExpansion" */
      id: string;
      description?: string;
      /** Optional validation hints */
      payloadType?: string;
      validateSchemaRef?: string;
    }
  