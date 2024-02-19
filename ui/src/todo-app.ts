import { CSSResult, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { TodoStore } from './todo-store';
import {
  AppBlock,
  ComputeContextInput,
  SensemakerStore,
} from '@neighbourhoods/client';
import {
  TaskItem,
  TaskList,
  getHashesFromNames,
  appletConfig,
  getCellId,
} from './index';
import { get } from 'svelte/store';
import { ContextSelector } from './components/sensemaker/context-selector';
import { ContextView } from './components/sensemaker/context-view';
import { decodeHashFromBase64 } from '@holochain/client';
import { AddItem } from './components/add-item';
import { ListItem } from './components/list-item';
import { StoreSubscriber } from 'lit-svelte-stores';

export class TodoApplet extends ScopedRegistryHost(AppBlock) {
  @state() loaded = false;

  @property() todoStore!: TodoStore;
  @property() sensemakerStore!: SensemakerStore;

  @property() lists: StoreSubscriber<string[]> = new StoreSubscriber(this, () =>
    this.todoStore.getLists()
  );

  @state() activeList: string | undefined;
  @state() activeContext: string | undefined;

  loadData = async () => {
    try {
      this.sensemakerStore = this.nhDelegate.sensemakerStore;
      // console.log("Delegate", this.nhDelegate)
      const appletRoleName = 'todo_lists';
      const cellInfo = this.nhDelegate.appInfo.cell_info[appletRoleName][0];
      const cellId = getCellId(cellInfo);
      const installAppId = this.nhDelegate.appInfo.installed_app_id;
      appletConfig.name = installAppId;
      this.todoStore = new TodoStore(
        this.nhDelegate.appAgentWebsocket,
        cellId!,
        appletRoleName
      );

      this.todoStore.fetchAllTasks();
      // console.log(allTasks)
      const allTaskEntryHashes = get(this.todoStore.allTaskEntryHashes());
      // console.log(allTaskEntryHashes)
      await this.nhDelegate.sensemakerStore.getAssessmentsForResources({
        resource_ehs: allTaskEntryHashes,
      });
      // console.log('got assessments');
      this.loaded = true;
    } catch (e) {
      console.log('error in first update', e);
    }
  };

  render() {
    const taskList = html`
      <div class="task-list-header">${this.activeList}</div>
      <task-list
        .listName=${this.activeList}
        .todoStore=${this.todoStore}
        .sensemakerStore=${this.sensemakerStore}
      ></task-list>
    `;

    const contextResult = html`
      <div class="task-list-header">${this.activeContext}</div>
      <context-view
        contextName=${this.activeContext}
        .todoStore=${this.todoStore}
        .sensemakerStore=${this.sensemakerStore}
      ></context-view>
    `;

    return html`
      <main class="layout">
        <div class="left-col">
          <div>
            <h1>Lists</h1>
            <div class="list-list-container">
              <ul @list-selected=${this.updateActiveList}>
                  ${this.lists?.value?.map(
                    listName => html`
                      <list-item
                        class="todo-list-list-item"
                        listName=${listName}
                      ></list-item>
                    `
                  )}
              </ul>
            </div>
            <h1>Data Views</h1>
            <context-selector .appId=${
              this.nhDelegate.appInfo.installed_app_id
            } .sensemakerStore=${this.sensemakerStore}></context-selector>
          </div>
          <div>
            <add-item itemType="list" @new-item=${this.addNewList}></add-item>
          </div>
        </div>
        <div class="right-col">
          ${this.activeContext ? contextResult : taskList}
          <add-item itemType="task" @new-item=${this.addNewTask}></add-item>
        </div>
      </main>
    `;
  }

  async addNewList(e: CustomEvent) {
    await this.todoStore.createNewList(e.detail.newValue);
    this.activeList = e.detail.newValue;
    this.activeContext = undefined;
  }
  async addNewTask(e: CustomEvent) {
    console.log('adding new item', e.detail.newValue);
    const createdTask = await this.todoStore.addTaskToList({
      task_description: e.detail.newValue,
      list: this.activeList!,
    });
    const options = {
      detail: { hash: createdTask.entry_hash },
      bubbles: true,
      composed: true,
    };
    this.dispatchEvent(new CustomEvent('task-hash-created', options));
  }
  // handle the @list-selected event from the list-list component
  updateActiveList(e: CustomEvent) {
    this.activeList = e.detail.selectedList;
    this.activeContext = undefined;
  }

  // // whenever the IMPORTANT TASKS view is selected, we recompute the context by passing it all the task entry hashes
  // // TODO: decouple context selection from context computation
  // async computeContext(e: CustomEvent) {
  //   const selectedContextName = e.detail.selectedList;
  //   const contextResultInput: ComputeContextInput = {
  //     resource_ehs: get(this.todoStore.allTaskEntryHashes()),
  //     context_eh: decodeHashFromBase64(getHashesFromNames([selectedContextName], get(this.sensemakerStore.contexts).get(this.nhDelegate.appInfo.installed_app_id)!)[0]),
  //     can_publish_result: false,
  //   }
  //   const contextResult = await this.sensemakerStore.computeContext(selectedContextName, contextResultInput)
  //   console.log('context result', contextResult)
  //   this.activeContext = selectedContextName;
  // }

  static elementDefinitions = {
    'task-list': TaskList,
    'context-selector': ContextSelector,
    'context-view': ContextView,
    'add-item': AddItem,
    'task-item': TaskItem,
    'list-item': ListItem,
  };

  static styles: CSSResult[] = [
    css`
      .layout {
        display: grid;
        grid-template-columns: 30% 70%;
        grid-template-rows: 1fr;
        width: 100%;
        height: calc(100vh - 72px);
        box-sizing: border-box;
        padding: 8px;
      }
      .left-col,
      .right-col {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
      }
      .left-col {
        grid-column: 1/2;
      }
      .right-col {
        grid-column: 2/-1;
      }
    `,
  ];
}
