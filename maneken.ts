import {
  AnyObject,
  CheaterOnType,
  CheaterType,
  ManecenEvent,
  ManecenStore,
  WatcherType,
} from "./type";

export function manecen<T>(o: T) {
  const watchers = new Set() as Set<WatcherType<T>>;
  let state = o;

  const getState = () => state;

  const change = (cheater: CheaterType<T>) => {
    state = cheater(state);
    watchers.forEach((x) => x(state));
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

  const newObj = { getState, change, watch, on };
  return newObj;
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