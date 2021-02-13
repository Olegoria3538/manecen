import { GraphCreateType } from "./graph";
import { createNode, NodeManeken } from "./node";
import { WatcherType } from "./type";

export function watch<T>(node: NodeManeken<T>, graph: GraphCreateType) {
  const watch = (w: WatcherType<T> | WatcherType<T>[]) => {
    Array.isArray(w)
      ? w.forEach((x) => graph.addWatch(node, x))
      : graph.addWatch(node, w);
  };
  return watch;
}

export function map<T>(node: NodeManeken<T>, graph: GraphCreateType) {
  return <Q>(fn: (x: T) => Q) => {
    const { last } = graph.connections.get(node);
    const nodeChildren = createNode<Q>(fn(last));
    graph.addMap(node, nodeChildren, fn);
    return nodeChildren;
  };
}

export function customMap<T>(
  node: NodeManeken<T>,
  mutator: <Q>(fn: (x: T) => Q) => NodeManeken<Q>,
  graph: GraphCreateType
) {
  return <Q>(fn: (x: T) => Q) => {
    const nodeChildren = mutator(fn);
    graph.addMap(node, nodeChildren, fn);
    return nodeChildren;
  };
}

export function to<T>(node: NodeManeken<T>, graph: GraphCreateType) {
  return (nodeTo: NodeManeken<T> | NodeManeken<T>[]) => {
    Array.isArray(nodeTo)
      ? nodeTo.forEach((x) => graph.addTo(node, x))
      : graph.addTo(node, nodeTo);
    return node;
  };
}

export function on<T>(node: NodeManeken<T>, graph: GraphCreateType) {
  return <N extends NodeManeken<Q>, Q>(
    nodeOn: N,
    fn: (state: T, data: Q) => T
  ) => {
    graph.addOn(node, nodeOn, fn);
    return node;
  };
}
