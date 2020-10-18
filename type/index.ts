interface Callable<R> {
  (...args: any[]): R;
}

export type TypeStore<T extends ManecenStore<any>> = ReturnType<T["getState"]>;

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

export type UnitApply<T, U extends UnitType = UnitType> = U extends "STORE"
  ? ManecenStore<T>
  : ManecenEvent<T>;

export type ManecenAllUnit<T> = ManecenStore<T> | ManecenEvent<T>;

export interface Unit<T, U extends UnitType> {
  mapsChildren: Set<UnitApply<any, U>>;
  shotWatchers: (state: T) => void;
  watch: (w: WatcherType<T> | WatcherType<T>[]) => void;
  toShot: (state: T) => void;
  to: (w: ManecenAllUnit<T> | ManecenAllUnit<T>[]) => void;
  map: <Q = any>(_mapMutator: MapMutator<T, Q>) => UnitApply<Q, U>;
  bedrock: {
    _mapMutator: MapMutator<any>;
    node: UnitType;
  };
}

export interface UnitOmit<T, U extends UnitType = UnitType>
  extends Omit<
    Unit<T, U>,
    "watchers" | "mapsChildren" | "shotWatchers" | "toShot"
  > {}

export interface ManecenStore<T> extends UnitOmit<T, "STORE"> {
  getState: () => T;
  change: (cheater: CheaterType<T>) => void;
  on: <E, Q extends ManecenEvent<E> = ManecenEvent<E>>(
    ev: Q,
    c: CheaterOnType<T, Parameters<Q>[0]>
  ) => void;
}

export interface ManecenEvent<T> extends UnitOmit<T, "EVENT"> {
  (x: T): void;
  bedrock: {
    addSubscription: (x: (x: T) => void) => void;
  } & UnitOmit<T>["bedrock"];
}
