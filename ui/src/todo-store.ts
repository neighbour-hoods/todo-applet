import { CellClient, HolochainClient } from '@holochain-open-dev/cell-client';
import {
  AgentPubKeyB64,
  Dictionary,
} from '@holochain-open-dev/core-types';
import { serializeHash } from '@holochain-open-dev/utils';
import { derived, get, Writable, writable } from 'svelte/store';
import { EntryHash, InstalledCell } from '@holochain/client';
import { TodoService } from './todo-service';
import { Task, TaskToListInput, WrappedEntry } from './types';

export class TodoStore {
  service: TodoService;

  // a front end store of all tasks in the dna
  // it is an object keyed by the list name
  #tasksInLists: Writable<Dictionary<Array<WrappedEntry<Task>>>> = writable({});

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

  // return all tasks in a list
  listTasks(listName: string) {
    return derived(this.#tasksInLists, lists => lists[listName]);
  }

  // return all lists
  listLists() {
    return derived(this.#tasksInLists, lists => Object.keys(lists));
  }

  // get all the task entry hashes so that we can get the assessments for them
  // or for computing contexts
  allTaskEntryHashes() {
    return derived(this.#tasksInLists, lists => {
      let allTaskEhs: EntryHash[] = []
      const listNames = Object.keys(lists);
      for (const list of listNames) {
        const listEhs = lists[list].map(wrappedTask => wrappedTask.entry_hash)
        allTaskEhs = [
          ...allTaskEhs,
          ...listEhs
        ]
      }
      return allTaskEhs
    })
  }

  tasksFromEntryHashes(entryHashes: EntryHash[]) {
    const serializedEntryHashes = entryHashes.map(entryHash => serializeHash(entryHash));
    return derived(this.#tasksInLists, lists => {
      const tasks = Object.values(lists).flat();
      return tasks.filter(task => serializedEntryHashes.includes(serializeHash(task.entry_hash)))
    })
  }

  async fetchAllTasks() {
    const fetchedTasks = await this.service.getAllTasks();
    this.#tasksInLists.update(tasks => ({
      ...tasks,
      ...fetchedTasks,
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
    let newTask = await this.service.addTaskToList(task);

    this.#tasksInLists.update(lists => {
      lists[task.list] = [...lists[task.list], newTask];
      return lists;
    });
  }

  async toggleTaskStatus(listName: string, wrappedTask: WrappedEntry<Task>) {
    let updatedTask = wrappedTask;
    if(('Complete' in wrappedTask.entry.status)) {
      await this.service.uncompleteTask(wrappedTask.action_hash);
      updatedTask.entry.status = { Incomplete: null };
    }
    else {
      await this.service.completeTask(wrappedTask.action_hash)
      updatedTask.entry.status = { Complete: null };
    }
    this.#tasksInLists.update(lists => {
      let updatedTaskInList = lists[listName].filter(({ action_hash: taskActionHash, entry: taskItem}) => serializeHash(taskActionHash) != serializeHash(wrappedTask.action_hash));
      updatedTaskInList.push(updatedTask);
      lists[listName] = updatedTaskInList;
      return lists;
    });
  }
}
