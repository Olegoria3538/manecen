import { graphMain, graphCreate, GraphCreateType } from "./graph";
import { map, to, watch, on, customMap } from "./maneken-staf-2";
import { WatcherType } from "./type";

export type NodeManeken<T> = {
  (x?: T): void;
  watch: (w: WatcherType<T> | WatcherType<T>[]) => void;
  map: <Q>(fn: (x: T) => Q) => NodeManeken<Q>;
  to: (nodeTo: NodeManeken<T> | NodeManeken<T>[]) => NodeManeken<T>;
  getLast: () => T;
  reset: () => void;
  on: <Q>(nodeOn: NodeManeken<Q>, fn: (state: T, data: Q) => T) => void;
};

export type NodeManekenOptionsType<T> = {
  map?: <Q>(fn: (x: T) => Q) => NodeManeken<Q>;
  reaction?: (x: T) => void;
  filterUpdate?: (x: T) => boolean;
  graph?: GraphCreateType;
};

export type createNodeType = typeof createNode;

export const createNode = <T>(
  x?: T,
  options?: NodeManekenOptionsType<T>
): NodeManeken<T> => {
  const graph = options?.graph || graphMain;
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
      return node;
    });
    connections.to.forEach((n) => {
      const shotNode = graph.connections.get(n);
      if (shotNode.last !== n) n(x);
      return node;
    });
    connections.watch.forEach((f) => f(x));
  };
  graph.addNode(node);
  graph.addFirst(node, x);
  graph.addLast(node, x);

  node.watch = watch(node, graph);
  node.map = options?.map
    ? customMap(node, options.map, graph)
    : map(node, graph);
  node.to = to(node, graph);
  node.reset = () => node(x);
  node.getLast = () => graph.getLast(node);
  node.on = on(node, graph);

  return node;
};

export const createBlackBox = (
  fn: (maneken: {
    createNode: createNodeType;
  }) => {
    in: any;
    out: any;
  }
) => {
  const graph = graphCreate();
  const res = fn({
    createNode: <T>(x: T, options: NodeManekenOptionsType<T>) =>
      createNode(x, { ...options, graph }),
  });
  return res;
};
