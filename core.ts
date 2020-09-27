import { manecenMap, manecenWatch } from "./maneken-staf";
import {
  ManecenEvent,
  ManecenStore,
  MapMutator,
  Unit,
  UnitType,
} from "./type";

export function manecenCore<T, U extends UnitType = UnitType>({
  mapFc,
  unit,
}: {
  mapFc: <Q>(
    _mapMutator: MapMutator<T, Q>
  ) => U extends "STORE" ? ManecenStore<Q> : ManecenEvent<Q>;
  unit: UnitType;
}): Unit<T, U> {
  const watch = manecenWatch<T>();
  const map = manecenMap<T, U>(mapFc);

  return {
    watchers: watch.watchers,
    watch: watch.watch,
    map: map.map,
    mapsChildren: map.mapsChildren,
    _: {
      _mapMutator: map._mapMutator,
      node: unit,
    },
  };
}
