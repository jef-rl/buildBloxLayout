export interface HandlerMessage<T> {
  type: string;
  payload: T;
}
