import { ActionHash, EntryHash, AppBundleSource, encodeHashToBase64 } from "@holochain/client";
import { pause, Player, runScenario } from "@holochain/tryorama";
import pkg from 'tape-promise/tape';
const { test } = pkg;

import { todoListsHapp } from "../../utils";


export default () => test("todo tasks CRUD tests", async (t) => {
  await runScenario(async scenario => {

    const appBundleSource: AppBundleSource = { path: todoListsHapp };
    let alice: Player;
    let bob: Player;
    try {
      [alice, bob] = await scenario.addPlayersWithApps([{ appBundleSource }, { appBundleSource }]);
      await scenario.shareAllAgents();
      const pauseDuration = 1000;

      let resp = await alice.cells[0].callZome({
        zome_name: "todo",
        fn_name: "create_new_list",
        payload: "groceries",
      });

      // Wait for the created entry to be propagated to the other node.
      await pause(pauseDuration);

      resp = await alice.cells[0].callZome({
        zome_name: "todo",
        fn_name: "create_new_list",
        payload: "inbox",
      });

      // Wait for the created entry to be propagated to the other node.
      await pause(pauseDuration);

      const lists: string[] = await bob.cells[0].callZome({
        zome_name: "todo",
        fn_name: "get_lists",
        payload: null,
      });
      console.log("lists: ", lists)
      t.deepEqual(lists.length, 2);
      t.ok(lists.includes("groceries"));
      t.ok(lists.includes("inbox"));

      const task = {
        task_description: "apples",
        list: "groceries"
      };
      const { action_hash: createAction }: any = await alice.cells[0].callZome({
        zome_name: "todo",
        fn_name: "add_task_to_list",
        payload: task,
      });
      t.ok(createAction);

      const task2 = {
        task_description: "bananas",
        list: "groceries"
      };
      const { action_hash: createAction2 }: any = await alice.cells[0].callZome({
        zome_name: "todo",
        fn_name: "add_task_to_list",
        payload: task2,
      });
      t.ok(createAction2);
      await pause(pauseDuration);

      const task3 = {
        task_description: "finish tests",
        list: "inbox"
      };
      const { action_hash: createAction3 }: any = await alice.cells[0].callZome({
        zome_name: "todo",
        fn_name: "add_task_to_list",
        payload: task3,
      });
      t.ok(createAction3);
      await pause(pauseDuration);
      const groceryTasks: { action_hash: ActionHash, entry_hash: EntryHash, entry: any }[] = await bob.cells[0].callZome({
        zome_name: "todo",
        fn_name: "get_tasks_in_list",
        payload: "groceries",
      });
      t.deepEqual(groceryTasks.length, 2)

      console.log('list', groceryTasks)
      t.ok(groceryTasks.find(({ action_hash, entry }) => encodeHashToBase64(action_hash) === encodeHashToBase64(createAction) && JSON.stringify(entry) === JSON.stringify({ description: 'apples', status: { Incomplete: null } })))
      t.ok(groceryTasks.find(({ action_hash, entry }) => encodeHashToBase64(action_hash) === encodeHashToBase64(createAction2) && JSON.stringify(entry) === JSON.stringify({ description: 'bananas', status: { Incomplete: null } })))

      const updateAction = await alice.cells[0].callZome({
        zome_name: "todo",
        fn_name: "complete_task",
        payload: createAction,
      });
      t.ok(updateAction);
      await pause(pauseDuration);

      const updatedGroceryTasks: { action_hash: ActionHash, entry_hash: EntryHash, entry: any }[] = await bob.cells[0].callZome({
        zome_name: "todo",
        fn_name: "get_tasks_in_list",
        payload: "groceries",
      });
      t.deepEqual(groceryTasks.length, 2)
      t.ok(updatedGroceryTasks.find(({ action_hash, entry }) => encodeHashToBase64(action_hash) === encodeHashToBase64(createAction) && JSON.stringify(entry) === JSON.stringify({ description: 'apples', status: { Complete: null } })))
      t.ok(updatedGroceryTasks.find(({ action_hash, entry }) => encodeHashToBase64(action_hash) === encodeHashToBase64(createAction2) && JSON.stringify(entry) === JSON.stringify({ description: 'bananas', status: { Incomplete: null } })))

      const allTasks: { [list: string]: any[] } = await bob.cells[0].callZome({
        zome_name: "todo",
        fn_name: "get_all_tasks",
        payload: null,
      });
      t.deepEqual(allTasks["groceries"].length, 2)
      t.deepEqual(allTasks["inbox"].length, 1)
    }
    catch (e) {
      console.log("error: ", e)
    }
  });
});
