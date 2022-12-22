import { CellClient } from '@holochain-open-dev/cell-client';
import { Dictionary, EntryHashB64 } from '@holochain-open-dev/core-types';
import { ActionHash } from '@holochain/client';
import { Task, TaskToListInput } from './types';

export class TodoService {
  constructor(public cellClient: CellClient, public zomeName = 'todo') {}

  async createNewList(input: string): Promise<null> {
    return this.callZome('create_new_list', input);
  }

  async addTaskToList(input: TaskToListInput): Promise<ActionHash> {
    return this.callZome('add_task_to_list', input);
  }

  async completeTask(input: ActionHash): Promise<ActionHash> {
    return this.callZome('complete_task', input);
  }

  async getLists(): Promise<Array<string>> {
    return this.callZome('get_lists', null);
  }

  async getTasksInList(input: ActionHash): Promise<Array<Task>> {
    return this.callZome('get_tasks_in_list', input);
  }

  async getAllTasks(): Promise<Dictionary<Array<string>>> {
    return this.callZome('get_all_tasks', null);
  }
  
  private callZome(fnName: string, payload: any) {
    return this.cellClient.callZome(this.zomeName, fnName, payload);
  }
}
