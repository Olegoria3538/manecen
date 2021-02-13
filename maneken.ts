import { createBlackBox } from "./node";

const main = createBlackBox(({ createNode }) => {
  const state = createNode<string[]>([]);
  const addTodoNode = createNode<string>();
  state.on(addTodoNode, (s, x) => [...s, x]);

  return { in: addTodoNode, out: state };
});

main.out.watch((x) => console.log(x));

for (let index = 0; index < 3; index++) {
  main.in(`add ${index}`);
}
