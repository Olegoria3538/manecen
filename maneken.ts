import { manecenCore } from "./core";
import {
  CheaterOnType,
  CheaterType,
  ManecenEvent,
  ManecenStore,
  NodeManecen,
  TypeStore,
  UnitOmit,
} from "./type";
import { graph, graphCreate } from "./graph";
import { createEvent, createGuard, createNode, createStore } from "./node";

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

export function manecenSample<T, C, Y = T>({
  source,
  clock,
  fn = (x) => (x as unknown) as Y,
}: {
  source: ManecenStore<T>;
  clock: NodeManecen<C>;
  fn?: (sourceData: T, clockData: C) => Y;
}) {
  const ev = manecenEvent<Y>();
  clock.watch((x) => {
    ev(fn(source.getState(), x));
  });
  return ev;
}

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

export function manecenRestore<T>(unit: NodeManecen<T>) {
  const store = manecen<T>(null);
  unit.watch((x) => store.change(() => x));
  return store;
}

export function manecenGuard<T>(
  unit: NodeManecen<T>,
  filter: (x: T) => Boolean
) {
  const ev = manecenEvent<T>();
  unit.watch((x) => {
    if (filter(x)) ev(x);
  });
  return ev;
}

const store = createStore(1);

const f = createEvent<number>();

const g = createGuard(f, (x) => x > 10);

g.watch((x) => console.log(x));
f(10);
f(11);
f(11);
f(8);
