import { graph } from "./graph";
import { map, to, watch, on } from "./maneken-staf-2";
import { WatcherType } from "./type";

export type NodeManeken<T> = {
  (x: T): void;
  watch: (w: WatcherType<T> | WatcherType<T>[]) => void;
  map: <Q>(fn: (x: T) => Q) => NodeManeken<Q>;
  to: (nodeTo: NodeManeken<T> | NodeManeken<T>[]) => void;
  reset: () => void;
};

export const createNode = <T>(
  x?: T,
  options?: {
    map?: <Q>(x: Q) => NodeManeken<Q>;
    reaction?: (x: T) => void;
    filterUpdate?: (x: T) => boolean;
  }
) => {
  const first = x;
  const node: NodeManeken<T> = (x) => {
    if (options?.filterUpdate ? !options.filterUpdate(x) : false) return;
    graph.addLast(node, x);
    if (options?.reaction) options.reaction(x);
    const connections = graph.connections.get(node);
    connections.map.forEach((c) => {
      const shotNode = graph.connections.get(c.node);
      if (shotNode.last !== x) c.node(c.fn(x));
    });
    connections.on.forEach((c) => {
      const { last: value } = graph.connections.get(c.node);
      const res = c.fn(value, x);
      if (value !== res) c.node(res);
    });
    connections.to.forEach((n) => {
      const shotNode = graph.connections.get(n);
      if (shotNode.last !== n) n(x);
    });
    connections.watch.forEach((f) => f(x));
  };
  graph.addNode(node);
  graph.addFirst(node, x);
  graph.addLast(node, x);
  node.watch = watch(node);
  node.map = map(node, options?.map);
  node.to = to(node);
  node.reset = () => node(first);
  return node;
};

interface StoreManeken<T> extends NodeManeken<T> {
  on: <Q>(nodeOn: NodeManeken<Q>, fn: (state: T, data: Q) => T) => void;
  map: <Q>(fn: (x: T) => Q) => StoreManeken<Q>;
  getState: () => T;
}

export const createStore = <T>(value: T) => {
  let state = value;
  const getState = () => state;
  const store = createNode<T>(value, {
    map: createStore,
    reaction: (x) => {
      state = x;
    },
  }) as StoreManeken<T>;
  store.on = on(store);
  store.getState = getState;
  return store;
};

interface EventManeken<T> extends NodeManeken<T> {}

export const createEvent = <T>(filter?: (x: T) => boolean) => {
  const event = createNode<T>(undefined, {
    filterUpdate: filter,
  }) as EventManeken<T>;
  return event;
};

interface GuardManeken<T> extends NodeManeken<T> {}

export const createGuard = <T>(
  node: NodeManeken<T>,
  filter?: (x: T) => boolean
) => {
  const guard = createNode<T>(undefined, {
    filterUpdate: filter,
  }) as GuardManeken<T>;
  node.to(guard);
  return guard;
};
