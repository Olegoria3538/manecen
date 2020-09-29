import { manecenMap, manecenTo, manecenWatch } from "./maneken-staf";
import { ManecenEvent, ManecenStore, MapMutator, Unit, UnitType } from "./type";

export function manecenCore<T, U extends UnitType = UnitType>({
  mapFc,
  unit,
}: {
  mapFc: <Q>(
    _mapMutator: MapMutator<T, Q>
  ) => U extends "STORE" ? ManecenStore<Q> : ManecenEvent<Q>;
  unit: UnitType;
}): Unit<T, U> {
  const { shotWatchers, watch } = manecenWatch<T>();
  const { map, mapsChildren, _mapMutator } = manecenMap<T, U>(mapFc);
  const { to, toShot } = manecenTo<T>();

  return {
    to,
    toShot,
    shotWatchers,
    watch,
    map,
    mapsChildren,
    _: {
      _mapMutator,
      node: unit,
    },
  };
}
