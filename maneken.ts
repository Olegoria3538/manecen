import { manecenCore } from "./core";
import {
  CheaterOnType,
  CheaterType,
  ManecenFn,
  ManecenEvent,
  ManecenStore,
} from "./type";

export function manecen<T>(o: T): ManecenStore<T> {
  let state = o;

  const { watchers, watch, mapsChildren, map, _ } = manecenCore<T, "STORE">({
    mapFc: (mutator) => manecen(mutator(state)),
    unit: "STORE",
  });

  const getState = () => state;

  const change = (cheater: CheaterType<T>) => {
    const _s = cheater(state);
    if (state === _s) return;
    state = cheater(state);
    watchers.forEach((f) => f(state));
    mapsChildren.forEach((x) => x.change(() => x._._mapMutator(state)));
  };

  const on = <Q extends ManecenFn = ManecenFn>(
    ev: Q,
    c: CheaterOnType<T, Parameters<Q>[0]>
  ) =>
    ev._.addSubscription((x: Parameters<Q>[0]) =>
      change((state: T) => c(state, x))
    );

  return { getState, change, watch, on, map, _ };
}

export function manecenEvent<T = void>(): ManecenEvent<T> {
  const { watchers, watch, mapsChildren, map, _ } = manecenCore<T, "EVENT">({
    mapFc: () => manecenEvent(),
    unit: "EVENT",
  });

  const subscription = new Set() as Set<(x: T) => void>;
  const addSubscription = (x: (x: T) => void) => {
    subscription.add(x);
  };

  const ev = Object.assign(
    (x: T) => {
      subscription.forEach((f) => f(x));
      watchers.forEach((f) => f(x));
      mapsChildren.forEach((f) => f(f._._mapMutator(x)));
    },
    {
      watch,
      map,
      _: { ..._, addSubscription },
    }
  );

  return ev;
}

const store = manecen(1);

const storeMap = store.map((x) => JSON.stringify(x));
const storeMap2 = store.map((x) => ({ x }));
storeMap2.watch((x) => console.log(x));
storeMap.watch((x) => console.log(x));

const event = manecenEvent<number>();

const eventMap = event.map((x) => ({ x }));
const eventMap2 = eventMap.map((x) => ({ ...x, a: "sfa" }));
eventMap2.watch((x) => console.log(x));
eventMap.watch((x) => console.log(x, "event map"));
store.on(event, (s, d) => s + d);
event(1);
event(1);
