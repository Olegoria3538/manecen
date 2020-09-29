import { manecenCore } from "./core";
import { CheaterOnType, CheaterType, ManecenEvent, ManecenStore } from "./type";

export function manecen<T>(o: T): ManecenStore<T> {
  let state = o;

  const { watch, shotWatchers, mapsChildren, to, toShot, map, _ } = manecenCore<
    T,
    "STORE"
  >({
    mapFc: (mutator) => manecen(mutator(state)),
    unit: "STORE",
  });

  const getState = () => state;

  const change = (cheater: CheaterType<T>) => {
    const _s = cheater(state);
    if (state === _s) return;
    state = _s;
    shotWatchers(state);
    toShot(state);
    mapsChildren.forEach((x) => x.change(() => x._._mapMutator(state)));
  };

  const on = <E, Q extends ManecenEvent<E> = ManecenEvent<E>>(
    ev: Q,
    c: CheaterOnType<T, Parameters<Q>[0]>
  ) =>
    ev._.addSubscription((x: Parameters<Q>[0]) =>
      change((state: T) => c(state, x))
    );

  return { getState, change, watch, on, map, to, _ };
}

export function manecenEvent<T = void>(): ManecenEvent<T> {
  const { watch, shotWatchers, mapsChildren, map, to, toShot, _ } = manecenCore<
    T,
    "EVENT"
  >({
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
      shotWatchers(x);
      toShot(x);
      mapsChildren.forEach((f) => f(f._._mapMutator(x)));
    },
    {
      to,
      watch,
      map,
      _: { ..._, addSubscription },
    }
  );

  return ev;
}

const store = manecen(1);
const store2 = manecen(234);

const event = manecenEvent<number>();
const event2 = manecenEvent<number>();
event2.watch((x) => console.log(x, "event"));

store.to([store2, event2]);

store.on(event, (s, d) => s + d);
event(1);
event(1);
