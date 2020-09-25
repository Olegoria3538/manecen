import {
  AnyObject,
  CheaterOnType,
  CheaterType,
  ManecenEvent,
  ManecenStore,
  MapMutator,
  WatcherType,
} from "./type";

export function manecen<T>(o: T) {
  const watchers = new Set() as Set<WatcherType<T>>;
  const mapsChildren = new Set() as Set<ManecenStore>;

  let state = o;

  const getState = () => state;

  const change = (cheater: CheaterType<T>) => {
    state = cheater(state);
    watchers.forEach((x) => x(state));
    mapsChildren.forEach((x) => x.change(() => x._mapMutator(state)));
  };

  const watch = (w: WatcherType<T> | WatcherType<T>[]) => {
    Array.isArray(w) ? w.forEach((x) => watchers.add(x)) : watchers.add(w);
  };

  const on = <Q extends ManecenEvent = ManecenEvent>(
    ev: Q,
    c: CheaterOnType<T, Parameters<Q>[0]>
  ) =>
    ev.addSubscription((x: Parameters<Q>[0]) =>
      change((state: T) => c(state, x))
    );

  const _mapMutator = (s: T) => state;
  const map = <Q>(_mapMutator: MapMutator<T, Q>) => {
    const _mapState = { ...manecen(_mapMutator(state)), _mapMutator };
    mapsChildren.add(_mapState);
    return _mapState;
  };

  return { getState, change, watch, on, map, _mapMutator };
}

export function manecenEvent<T = void>() {
  const watchers = new Set() as Set<WatcherType<T>>;
  const watch = (w: WatcherType<T> | WatcherType<T>[]) => {
    Array.isArray(w) ? w.forEach((x) => watchers.add(x)) : watchers.add(w);
  };

  const subscription = new Set() as Set<(x: T) => void>;
  const addSubscription = (x: (x: T) => void) => {
    subscription.add(x);
  };

  const ev = Object.assign(
    (x: T) => {
      subscription.forEach((f) => f(x));
      watchers.forEach((f) => f(x));
    },
    {
      watch,
    },
    {
      addSubscription,
    }
  );

  return ev;
}

const store = manecen(1);
store.watch((x) => console.log(x));

const event = manecenEvent<number>();
store.on(event, (s, d) => s + d);

event(1);
event(234);

const storeMap = store.map((x) => x - 100);
storeMap.watch((x) => console.log(x, "map store"));

const storeMap2 = storeMap.map((x) => !!x);
storeMap2.watch((x) => console.log(x, "map store2"));

event(1);
event(5);

store.change(() => 40);
