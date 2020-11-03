import { graph } from "./graph";
import { createNode, NodeManeken } from "./node";
import { WatcherType } from "./type";

export function watch<T>(node: NodeManeken<T>) {
  const watch = (w: WatcherType<T> | WatcherType<T>[]) => {
    Array.isArray(w)
      ? w.forEach((x) => graph.addWatch(node, x))
      : graph.addWatch(node, w);
  };
  return watch;
}

export function map<T>(
  node: NodeManeken<T>,
  fnMap: <Q>(x?: Q) => NodeManeken<Q>
) {
  return <Q>(fn: (x: T) => Q) => {
    const { last } = graph.connections.get(node);
    const nodeChildren = fnMap ? fnMap<Q>(fn(last)) : createNode<Q>(fn(last));
    graph.addMap(node, nodeChildren, fn);
    return nodeChildren;
  };
}

export function to<T>(node: NodeManeken<T>) {
  return (nodeTo: NodeManeken<T> | NodeManeken<T>[]) => {
    Array.isArray(nodeTo)
      ? nodeTo.forEach((x) => graph.addTo(node, x))
      : graph.addTo(node, nodeTo);
  };
}

export function on<T>(node: NodeManeken<T>) {
  return <N extends NodeManeken<Q>, Q>(
    nodeOn: N,
    fn: (state: T, data: Q) => T
  ) => {
    graph.addOn(node, nodeOn, fn);
  };
}
