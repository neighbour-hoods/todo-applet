import { ActionHash, AppAgentCallZomeRequest, AppAgentClient, RoleName } from '@holochain/client';
import { Task, TaskToListInput, WrappedEntry } from './types';

export class TodoService {
  constructor(public client: AppAgentClient, public roleName: RoleName, public zomeName = 'todo') {}

  async createNewList(input: string): Promise<null> {
    return this.callZome('create_new_list', input);
  }

  async addTaskToList(input: TaskToListInput): Promise<WrappedEntry<Task>> {
    return this.callZome('add_task_to_list', input);
  }

  async completeTask(input: ActionHash): Promise<ActionHash> {
    return this.callZome('complete_task', input);
  }

  async uncompleteTask(input: ActionHash): Promise<ActionHash> {
    return this.callZome('uncomplete_task', input);
  }

  async getLists(): Promise<Array<string>> {
    return this.callZome('get_lists', null);
  }

  async getTasksInList(input: ActionHash): Promise<Array<WrappedEntry<Task>>> {
    return this.callZome('get_tasks_in_list', input);
  }

  async getAllTasks(): Promise<{ [listName: string]: Array<WrappedEntry<Task>>}> {
    return this.callZome('get_all_tasks', null);
  }
  
  private callZome(fn_name: string, payload: any) {
    const req: AppAgentCallZomeRequest = {
      role_name: this.roleName,
      zome_name: this.zomeName,
      fn_name,
      payload
    }
    return this.client.callZome(req);
  }
}
