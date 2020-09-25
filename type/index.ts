import { manecen, manecenEvent } from "../maneken";

export interface AnyObject {
  [k: string]: any;
}

export type WatcherType<T> = (state: T) => void;

export type CheaterType<T> = (state: T) => T;

export type CheaterOnType<T, Q> = (state: T, data: Q) => T;

export type MapMutator<T, Q = any> = (state: T) => Q;

export type ManecenEvent = ReturnType<typeof manecenEvent>;

export type ManecenStore = ReturnType<typeof manecen>;
