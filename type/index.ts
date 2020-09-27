import { manecenEvent } from "../maneken";

interface Callable<R> {
  (...args: any[]): R;
}

export type MapCoreFc = <T, Q, U extends UnitType>(
  _mapMutator: MapMutator<T, Q>
) => U extends "STORE" ? ManecenStore<T> : any;

export type GenericReturnType<R, X> = X extends Callable<R> ? R : never;

export interface AnyObject {
  [k: string]: any;
}

export type UnitType = "STORE" | "EVENT";
export type WatcherType<T> = (state: T) => void;
export type CheaterType<T> = (state: T) => T;
export type CheaterOnType<T, Q> = (state: T, data: Q) => T;
export type MapMutator<T, Q = any> = (state: T) => Q;
export type ManecenFn = ReturnType<typeof manecenEvent>;

export type UnitApply<T, U extends UnitType = UnitType> = U extends "STORE"
  ? ManecenStore<T>
  : ManecenEvent<T>;

export interface Unit<T, U extends UnitType> {
  watchers: Set<WatcherType<T>>;
  mapsChildren: Set<UnitApply<any, U>>;
  watch: (w: WatcherType<T> | WatcherType<T>[]) => void;
  map: <Q>(
    _mapMutator: MapMutator<T, Q>
  ) => U extends "STORE" ? ManecenStore<Q> : ManecenEvent<Q>;
  _: {
    _mapMutator: MapMutator<T>;
    node: UnitType;
  };
}

export interface UnitOmit<T, U extends UnitType = UnitType>
  extends Omit<Unit<T, U>, "watchers" | "mapsChildren"> {}

export interface ManecenStore<T> extends UnitOmit<T, "STORE"> {
  getState: () => T;
  change: (cheater: CheaterType<T>) => void;
  on: <Q extends ManecenFn = ManecenFn>(
    ev: Q,
    c: CheaterOnType<T, Parameters<Q>[0]>
  ) => void;
}

export interface ManecenEvent<T> extends UnitOmit<T, "EVENT"> {
  (x: T): void;
  _: {
    addSubscription: (x: (x: T) => void) => void;
  } & UnitOmit<T>["_"];
}
