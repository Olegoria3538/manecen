import {
  ManecenEvent,
  ManecenStore,
  MapMutator,
  UnitApply,
  UnitType,
  WatcherType,
} from "./type";

export function manecenWatch<T>() {
  const watchers = new Set() as Set<WatcherType<T>>;
  const watch = (w: WatcherType<T> | WatcherType<T>[]) => {
    Array.isArray(w) ? w.forEach((x) => watchers.add(x)) : watchers.add(w);
  };
  return { watchers, watch };
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
    unit._._mapMutator = (_mapMutator as unknown) as MapMutator<Q, any>;
    mapsChildren.add(unit);
    return unit;
  };

  return { mapsChildren, map, _mapMutator };
}
