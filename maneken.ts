import { type } from "os";
import { manecenCore } from "./core";
import {
  CheaterOnType,
  CheaterType,
  ManecenEvent,
  ManecenStore,
  TypeStore,
} from "./type";

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

type FFFF = {
  F: any;
};

export function manecenCombine<T extends { [k: string]: ManecenStore<any> }>(
  o: T
): ManecenStore<{ [K in keyof T]: TypeStore<T[K]> }> {
  const stores = Object.entries(o);
  const store = manecen(
    stores
      .map((x) => ({ [x[0]]: x[1].getState() }))
      .reduce((a, b) => ({ ...a, ...b }), {}) as {
      [K in keyof T]: TypeStore<T[K]>;
    }
  );
  stores.forEach((x) =>
    x[1].watch((q) => store.change((z) => ({ ...z, [x[0]]: q })))
  );

  return store;
}

const store = manecen<number>(1);
const store2 = manecen(234);

const com = manecenCombine({
  f: store,
  A: store2,
  sdf: store.map((x) => ({ x })),
});

com.watch((x) => console.log(x));

store.change((x) => x + 10);
store.change((x) => x + 10);

type AnyObject = { [k: string]: any };

const b = <T extends AnyObject>(o: T): T => {
  const ar = Object.entries(o);
  const res = ar
    .map((x) => ({ [x[0]]: x[1] }))
    .reduce((a, b) => ({ ...a, ...b }), {}) as T;
  return res;
};

const d = b({ dfs: "sfd", v: 1231 });
