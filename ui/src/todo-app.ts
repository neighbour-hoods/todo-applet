import NHContextSelector from './../../../../ui/app/src/nh-config/nh-context-selector';
// TODO: export this component from nh-design-system-components
import { CSSResult, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { TodoStore } from './todo-store';
import { AppBlock, NHDelegateReceiver, AppBlockDelegate, SensemakerStore, sensemakerStoreContext, AppletConfig } from '@neighbourhoods/client';
import { TaskItem, TaskList, appletConfig, getCellId } from './index';
import { get } from 'svelte/store';
// import { ContextSelector } from './components/sensemaker/context-selector';
import { ContextView } from './components/sensemaker/context-view';
import { AddItem } from './components/add-item';
import { ListItem } from './components/list-item';
import { StoreSubscriber } from 'lit-svelte-stores';
import { repeat } from 'lit/directives/repeat.js';

export class TodoApplet extends ScopedRegistryHost(AppBlock) implements NHDelegateReceiver<AppBlockDelegate> {
  @state() loaded = false;

  @property() todoStore!: TodoStore;

  @property() sensemakerStore!: SensemakerStore;

  @state() activeList: string | undefined;
  @state() activeContext: string | undefined;
  @state() config!: AppletConfig;

  lists: StoreSubscriber<string[]> = new StoreSubscriber(this as any, () =>
    this.todoStore.getLists(), () => [this.config]
  );

  loadData = async () => {
    try {
      this.sensemakerStore = this.nhDelegate.sensemakerStore;
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

      this.todoStore?.fetchAllTasks();
      const allTaskEntryHashes = get(this.todoStore.allTaskEntryHashes());

      await this.nhDelegate.sensemakerStore.getAssessmentsForResources({
        resource_ehs: allTaskEntryHashes,
      });

      const config = await this.sensemakerStore.checkIfAppletConfigExists(installAppId)
      if(config) {
        this.config = config
      }
      
      this.loaded = true;
    } catch (e) {
      console.log('error in first update', e);
    }
  };

  renderContextResults() {
    
    // const contextResult = html`
    //   <div class="task-list-header">${this.activeContext}</div>
    //   <context-view
    //     contextName=${this.activeContext}
    //     .todoStore=${this.todoStore}
    //     .sensemakerStore=${this.sensemakerStore}
    //   ></context-view>
    // `;

  }

  renderContextsList() {
    return html`
      <h2>Contexts</h2>
      <nh-context-selector
        id="select-context"
        .sensemakerStore=${this.sensemakerStore}
        .selectedAppletInstanceId=${this.nhDelegate.appInfo.installed_app_id}
        .selectedContextEhB64=${'this.selectedContextEhB64'}
      >
      </nh-context-selector>
    `
  }

  renderListsList() {
    return html`
      <h1>Lists</h1>
      <ul class="list-list-container" @list-selected=${this.updateActiveList}>
        ${this.lists?.value 
          ? repeat(this.lists.value, (_) => +(new Date()), (list, _idx) => {
              return html`
                <list-item
                  class="todo-list-list-item"
                  .selected=${this.activeList == list}
                  listName=${list}
                ></list-item>
            `
          })
          : null
        }
      </ul>
    `
  }

  renderTaskList() {
    return html`
      <div>
        <div class="task-list-header">${this.activeList || 'Create/select a list!'}</div>
        <task-list
          .listName=${this.activeList}
          .todoStore=${this.todoStore}
          .config=${this.config}
          .sensemakerStore=${this.sensemakerStore}
        ></task-list>
      </div>
    `
  }

  render() {
    return html`
      <main class="layout">
        <div class="left-col">
          <div class="container">
            ${this.renderListsList()}
            ${this.renderContextsList()}
          </div>
          <div>
            <add-item itemType="list" @new-item=${this.addNewList}></add-item>
          </div>
        </div>
        <div class="right-col">
          ${this.activeContext ? this.renderContextResults() : this.renderTaskList()}
          <add-item itemType="task" @new-item=${this.addNewTask}></add-item>
        </div>
      </main>
    `;
  }

  async addNewList(e: CustomEvent) {
    await this.todoStore?.createNewList(e.detail.newValue);
    this.activeList = e.detail.newValue;
    this.activeContext = undefined;
  }
  async addNewTask(e: CustomEvent) {
    const createdTask = await this.todoStore.addTaskToList({
      task_description: e.detail.newValue,
      list: this.activeList!,
    });
    const options = { detail: { hash: createdTask.entry_hash }, bubbles: true, composed: true, };
    (this as any).dispatchEvent(new CustomEvent('task-hash-created', options));
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
    'nh-context-selector': NHContextSelector,
    'context-view': ContextView,
    'add-item': AddItem,
    'task-item': TaskItem,
    'list-item': ListItem,
  };

  static styles: CSSResult[] = [
    css`
      /* Layout */
      .layout {
        display: grid;
        grid-template-columns: 40% auto;
        grid-template-rows: 1fr;
        width: 100%;
        height: calc(100vh - 72px);
        gap: 16px; 
        box-sizing: border-box;
        padding: 16px;
      }
      .left-col,
      .right-col {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        padding: 16px;
        border-radius: 8px;
        background: rgb(37, 31, 40);
      }
      .left-col {
        grid-column: 1/2;
      }
      .right-col {
        grid-column: 2/-1;
      }
      .right-col > div {
        display: flex;
        flex: 1;
        flex-direction: column;
      }

      .container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        height: 100%;
      }

      .list-list-container {
        display: flex;
        flex: 1;
        padding: 0;
        margin: 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
      }

      .task-list-header {
        background: #6E46CC;
        border-radius: 8px;
        height: 2.5rem;
        padding: 8px;
        box-sizing: border-box;
        text-align: center;
        color: #fff;
        display: grid;
        place-content: center;
        font-weight: 600;
      }

      .todo-list-list-item {
        color: #fff;
        display: flex;
        flex: 1 1 0%;
        width: 100%;
      }

      /* Typo */
      h1, h2 {
        color: #fff;
        font-weight: 600;
        font-family: "Work Sans", "Open Sans";
        margin: 16px 0;
        text-align: center;
      }
      h1 {
        font-size: 32px;
      }
      h2 {
        font-size: 24px;
      }
    `,
  ];
}
