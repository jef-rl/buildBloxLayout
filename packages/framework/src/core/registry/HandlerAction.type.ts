
export type HandlerAction<TPayload = Record<string, unknown>> = {
  type: string;
  payload?: TPayload;
};
