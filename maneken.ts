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
  let state = o;

  const watchers = new Set() as Set<WatcherType<T>>;
  const mapsChildren = new Set() as Set<ManecenStore>;

  const getState = () => state;

  const change = (cheater: CheaterType<T>) => {
    state = cheater(state);
    watchers.forEach((f) => f(state));
    mapsChildren.forEach((x) => x.change(() => x._._mapMutator(state)));
  };

  const watch = (w: WatcherType<T> | WatcherType<T>[]) => {
    Array.isArray(w) ? w.forEach((x) => watchers.add(x)) : watchers.add(w);
  };

  const on = <Q extends ManecenEvent = ManecenEvent>(
    ev: Q,
    c: CheaterOnType<T, Parameters<Q>[0]>
  ) =>
    ev._.addSubscription((x: Parameters<Q>[0]) =>
      change((state: T) => c(state, x))
    );

  const _mapMutator: MapMutator<T> = (_: T) => _;
  const map = <Q>(_mapMutator: MapMutator<T, Q>) => {
    const s = manecen(_mapMutator(state));
    const _mapState = {
      ...s,
      _: { ...s._, _mapMutator },
    };
    mapsChildren.add(_mapState);
    return _mapState;
  };

  const _ = { _mapMutator };

  return { getState, change, watch, on, map, _ };
}

export function manecenEvent<T = void>() {
  const watchers = new Set() as Set<WatcherType<T>>;
  const watch = (w: WatcherType<T> | WatcherType<T>[]) => {
    Array.isArray(w) ? w.forEach((x) => watchers.add(x)) : watchers.add(w);
  };

  const mapsChildren = new Set() as Set<ManecenEvent>;
  const _mapMutator: MapMutator<T> = (_: T) => _;
  const map = <Q>(_mapMutator: MapMutator<T, Q>) => {
    const ev = manecenEvent<Q>();
    ev._._mapMutator = (_mapMutator as unknown) as MapMutator<Q, any>;
    mapsChildren.add(ev);
    return ev;
  };
  const _ = { _mapMutator };

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
    },
    {
      _: {
        addSubscription,
        _mapMutator,
      },
    }
  );

  return ev;
}

const store = manecen(1);
store.watch((x) => console.log(x));

const event = manecenEvent<number>();
const eventMap = event.map((x) => "string " + x);
eventMap.watch((x) => console.log(x));

const stringStore = manecen("");
stringStore.watch(x => console.log(x, 'store string'))
stringStore.on(eventMap, (x, d) => x + d);
eventMap("s");

store.on(event, (s, d) => s + d);

const storeMap = store.map((x) => x - 100);
storeMap.watch((x) => console.log(x, "map store"));

const storeMap2 = storeMap.map((x) => ({ x: x }));
storeMap2.watch((x) => console.log(x, "map store2"));

const storeMap3 = storeMap2.map(({ x }) => ({ a: x * 2 }));
storeMap3.watch((x) => console.log(x, "map store3"));

//store.change(() => 40);
