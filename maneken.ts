import { manecenCore } from "./core";
import { CheaterOnType, CheaterType, ManecenEvent, ManecenStore } from "./type";

export function manecen<T>(o: T): ManecenStore<T> {
  let state = o;

  const {
    watch,
    shotWatchers,
    mapsChildren,
    to,
    toShot,
    map,
    bedrock,
  } = manecenCore<T, "STORE">({
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
    mapsChildren.forEach((x) => x.change(() => x.bedrock._mapMutator(state)));
  };

  const on = <E, Q extends ManecenEvent<E> = ManecenEvent<E>>(
    ev: Q,
    c: CheaterOnType<T, Parameters<Q>[0]>
  ) =>
    ev.bedrock.addSubscription((x: Parameters<Q>[0]) =>
      change((state: T) => c(state, x))
    );

  return { getState, change, watch, on, map, to, bedrock };
}

export function manecenEvent<T = void>(): ManecenEvent<T> {
  const {
    watch,
    shotWatchers,
    mapsChildren,
    map,
    to,
    toShot,
    bedrock,
  } = manecenCore<T, "EVENT">({
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
      mapsChildren.forEach((f) => f(f.bedrock._mapMutator(x)));
    },
    {
      to,
      watch,
      map,
      bedrock: { ...bedrock, addSubscription },
    }
  );

  return ev;
}

export function manecenSample<T, Q, Y>({
  source,
  clock,
  fn,
}: {
  source: ManecenStore<T>;
  clock: ManecenEvent<Q>;
  fn: (sourceData: T, clockData: Q) => Y;
}) {
  const ev = manecenEvent<ReturnType<typeof fn>>();
  clock.watch((x) => {
    ev(fn(source.getState(), x));
  });
  return ev;
}

const store = manecen<number>(1);
const store2 = manecen(234);

const event = manecenEvent<number>();
const event2 = manecenEvent<number>();
event2.watch((x) => console.log(x, "event"));
store2.watch((x) => console.log(x, "store"));

store.to([store2, event2]);

const eventMap = { f: event.map((x) => String(x)) };

const sample = manecenSample({
  source: store.map((x) => x + 1),
  clock: event.map<string>((x) => String(x)),
  fn: (x, y) => ({ x, y }),
});

sample.watch((x) => console.log(x, "sample"));

event(123);
