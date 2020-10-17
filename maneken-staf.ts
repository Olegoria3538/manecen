import {
  ManecenAllUnit,
  ManecenEvent,
  ManecenStore,
  MapMutator,
  UnitApply,
  UnitType,
  WatcherType,
} from "./type";

export function manecenWatch<T>() {
  const watchers = new Set() as Set<WatcherType<T>>;
  const shotWatchers = (state: T) => watchers.forEach((f) => f(state));
  const watch = (w: WatcherType<T> | WatcherType<T>[]) => {
    Array.isArray(w) ? w.forEach((x) => watchers.add(x)) : watchers.add(w);
  };
  return { watchers, watch, shotWatchers };
}

export function manecenMap<T, U extends UnitType = UnitType>(
  mapFc: <Q>(
    _mapMutator: MapMutator<T, Q>
  ) => U extends "STORE" ? ManecenStore<Q> : ManecenEvent<Q>
) {
  const mapsChildren = new Set<UnitApply<any, U>>();

  const _mapMutator: MapMutator<T> = (_: T) => _;
  const map = <Q>(_mapMutator: MapMutator<T, Q>) => {
    const unit = mapFc(_mapMutator);
    unit.bedrock._mapMutator = (_mapMutator as unknown) as MapMutator<Q, any>;
    mapsChildren.add(unit);
    return unit;
  };

  return { mapsChildren, map, _mapMutator };
}

export function manecenTo<T>() {
  const toList = new Set() as Set<ManecenAllUnit<T>>;
  const toShot = (state: T) => {
    toList.forEach((x) => {
      if (x.bedrock.node === "STORE") {
        const store = x as ManecenStore<T>;
        store.change(() => state);
      }
      if (x.bedrock.node === "EVENT") {
        const EVENT = x as ManecenEvent<T>;
        EVENT(state);
      }
    });
  };
  const to = (w: ManecenAllUnit<T> | ManecenAllUnit<T>[]) => {
    Array.isArray(w) ? w.forEach((x) => toList.add(x)) : toList.add(w);
  };
  return { toShot, to };
}
