export interface HandlerMessage<TPayload = any> {
  type: string;
  payload: TPayload;
}
