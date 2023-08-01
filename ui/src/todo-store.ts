import { derived, get, Writable, writable } from 'svelte/store';
import { AgentPubKey, AgentPubKeyB64, AppAgentClient, AppSignal, AppWebsocket, CellId, encodeHashToBase64, EntryHash, RoleName } from '@holochain/client';
import { TodoService } from './todo-service';
import { SignalPayload, Task, TaskToListInput, WrappedEntry } from './types';

export class TodoStore {
  service: TodoService;

  // a front end store of all tasks in the dna
  // it is an object keyed by the list name
  #tasksInLists: Writable<{ [listName: string]: Array<WrappedEntry<Task>>}> = writable({});

  public myAgentPubKey: AgentPubKeyB64;
  // get myAgentPubKey(): AgentPubKeyB64 {
  //   return encodeHashToBase64(this.todoCell.cell_id[1]);
  // }

  constructor(
    protected client: AppAgentClient,
    protected cellId: CellId,
    roleName: RoleName,
  ) {
    client.on("signal", (signal: AppSignal) => {
      console.log("received signal: ", signal)
      const payload = (signal.payload as SignalPayload);

      switch (payload.type) {
        case "NewTask":
          const task = payload.task;
          this.#tasksInLists.update(lists => {
            lists[task.entry.list] = [...lists[task.entry.list], task];
            return lists;
          });
          break;
        case "NewList":
          const list = payload.list;
          this.#tasksInLists.update(lists => {
            lists[list] = [];
            return lists;
          });
          break;
      }
    });
    this.service = new TodoService(
      client,
      cellId,
      roleName
    );
    this.myAgentPubKey = encodeHashToBase64(cellId[1]);
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
    const serializedEntryHashes = entryHashes.map(entryHash => encodeHashToBase64(entryHash));
    return derived(this.#tasksInLists, lists => {
      let tasks: WrappedEntry<Task>[] = [];
      Object.values(lists).map(list => {
        tasks = [...tasks, ...list] 
      })
      return tasks.filter(task => serializedEntryHashes.includes(encodeHashToBase64(task.entry_hash)))
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

  async addTaskToList(task: TaskToListInput): Promise<WrappedEntry<Task>> {
    let newTask = await this.service.addTaskToList(task);
    console.log('task from service', newTask)

    this.#tasksInLists.update(lists => {
      lists[task.list] = [...lists[task.list], newTask];
      return lists;
    });
    return newTask
  }

  async toggleTaskStatus(wrappedTask: WrappedEntry<Task>) {
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
      // find which list the task is in and update it
      Object.keys(lists).map(list => {
        lists[list].map(task => {
          if(encodeHashToBase64(task.action_hash) == encodeHashToBase64(wrappedTask.action_hash)) {
            let updatedTaskInList = lists[list].filter(({ action_hash: taskActionHash, entry: taskItem}) => encodeHashToBase64(taskActionHash) != encodeHashToBase64(wrappedTask.action_hash));
            updatedTaskInList.push(updatedTask);
            lists[list] = updatedTaskInList;
          }
      })}); 
      return lists;
    });
  }
}
