import { NodeManeken } from "./node";

type ConnectionsType = {
  first: any;
  last: any;
  watch: Set<(x: any) => void>;
  map: Set<{
    fn: (x: any) => any;
    node: NodeManeken<any>;
  }>;
  to: Set<NodeManeken<any>>;
  on: Set<{
    fn: (state: any, data: any) => any;
    node: NodeManeken<any>;
  }>;
};

export type GraphCreateType = {
  connections: Map<NodeManeken<any>, ConnectionsType>;
  addNode: (node: NodeManeken<any>) => void;
  addWatch: (node1: NodeManeken<any>, node2: (x: any) => void) => void;
  addMap: (
    node: NodeManeken<any>,
    nodeChildren: NodeManeken<any>,
    fn: (x: any) => any
  ) => void;
  addTo: (node: NodeManeken<any>, nodeTo: NodeManeken<any>) => void;
  addOn: (
    node: NodeManeken<any>,
    nodeOn: NodeManeken<any>,
    fn: (state: any, data: any) => any
  ) => void;
  addFirst: (node: NodeManeken<any>, x: any) => void;
  addLast: (node: NodeManeken<any>, x: any) => void;
  getLast: (node: NodeManeken<any>) => any;
};

export const graphCreate = (): GraphCreateType => {
  const connections = new Map<NodeManeken<any>, ConnectionsType>();
  const addNode = (node: NodeManeken<any>) => {
    connections.set(node, {
      watch: new Set(),
      map: new Set(),
      to: new Set(),
      on: new Set(),
      first: null,
      last: null,
    });
  };
  const addWatch = (node: NodeManeken<any>, watch: (x: any) => void) => {
    const d = connections.get(node);
    d.watch.add(watch);
  };
  const addMap = (
    node: NodeManeken<any>,
    nodeChildren: NodeManeken<any>,
    fn: (x: any) => any
  ) => {
    const d = connections.get(node);
    d.map.add({ node: nodeChildren, fn });
  };
  const addTo = (node: NodeManeken<any>, nodeTo: NodeManeken<any>) => {
    const d = connections.get(node);
    d.to.add(nodeTo);
  };
  const addOn = (
    node: NodeManeken<any>,
    nodeOn: NodeManeken<any>,
    fn: (state: any, data: any) => any
  ) => {
    const d = connections.get(nodeOn);
    d.on.add({ node, fn });
  };
  const addFirst = (node: NodeManeken<any>, x: any) => {
    const d = connections.get(node);
    d.first = x;
  };
  const addLast = (node: NodeManeken<any>, x: any) => {
    const d = connections.get(node);
    d.last = x;
  };
  const getLast = (node: NodeManeken<any>) => {
    const d = connections.get(node);
    return d.last;
  };

  return {
    connections,
    addNode,
    addWatch,
    addMap,
    addTo,
    addOn,
    addFirst,
    addLast,
    getLast,
  };
};

export const graphMain = graphCreate();
