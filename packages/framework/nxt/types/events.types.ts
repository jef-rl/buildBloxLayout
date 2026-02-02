export interface HandlerMessage<T> {
  type: string;
  payload: T;
}

export interface UiEventDetail {
  type: string;
  payload: any;
}
