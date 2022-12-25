import { CellClient, HolochainClient } from '@holochain-open-dev/cell-client';
import {
  AgentPubKeyB64,
  Dictionary,
  DnaHashB64,
  EntryHashB64,
} from '@holochain-open-dev/core-types';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';
import { derived, get, Writable, writable } from 'svelte/store';
import { AdminWebsocket, DnaHash, InstalledCell } from '@holochain/client';
import { TodoService } from './todo-service';
import { Task, TaskToListInput } from './types';

export class TodoStore {
  service: TodoService;

  #tasksInLists: Writable<Dictionary<Array<Task>>> = writable({});

  #openedList: Writable<string> = writable("");

  listTasks(listName: string) {
    return derived(this.#tasksInLists, lists => lists[listName]);
  }

  get myAgentPubKey(): AgentPubKeyB64 {
    return serializeHash(this.todoCell.cell_id[1]);
  }

  constructor(
    protected client: HolochainClient,
    protected todoCell: InstalledCell,
    zomeName: string = 'todo'
  ) {
    this.service = new TodoService(
      new CellClient(client, todoCell),
      zomeName
    );
  }

  async fetchAllTasks() {
    const fetchedTasks = await this.service.getAllTasks();

    this.#tasksInLists.update(tasks => ({
      ...tasks,
    }));
    return get(this.#tasksInLists)
  }

  async createNewList(list: string) {
    await this.service.createNewList(list);

    this.#tasksInLists.update(lists => {
      lists[list] = [];
      return lists;
    });
  }

  async addTaskToList(task: TaskToListInput) {
    await this.service.addTaskToList(task);

    this.#tasksInLists.update(lists => {
      lists[task.list] = [...lists[task.list], {
        description: task.task_description,
        status: { Incomplete: null }
      }];
      return lists;
    });
  }
}
