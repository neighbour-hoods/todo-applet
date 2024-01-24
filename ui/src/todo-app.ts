import { css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { CircularProgress } from "@scoped-elements/material-web";
import { TodoStore } from './todo-store';
import {
  AppBlock,
  ComputeContextInput,
  SensemakerStore
} from '@neighbourhoods/client';
import {
  TaskItem,
  TaskList,
  getHashesFromNames,
  getHashesFromResourceDefNames,
  appletConfig,
  getCellId
} from './index'
import { get } from 'svelte/store';
import { ContextSelector } from './components/sensemaker/context-selector';
import { ContextView } from './components/sensemaker/context-view';
import { Checkbox, List } from '@scoped-elements/material-web'
import { decodeHashFromBase64, encodeHashToBase64 } from '@holochain/client';
import { variables } from './styles/variables';
import { AddItem } from './components/add-item';
import { ListItem } from "./components/list-item";
import { AppletInfo } from '@neighbourhoods/client';
import { StoreSubscriber } from 'lit-svelte-stores';

export class TodoApplet extends ScopedRegistryHost(AppBlock) {
  @state()
  loaded = false;

  @property()
  todoStore!: TodoStore;

  @property()
  sensemakerStore!: SensemakerStore;

  @state()
  activeList: string | undefined

  @state()
  activeContext: string | undefined

  @state()
  defaultUISettings = true

  @property()
  lists: StoreSubscriber<string[]> = new StoreSubscriber(this, () => this.todoStore.getLists());

  async firstUpdated() {
    console.log("first updated")
  }

  loadData = async() => {
    try {
      this.sensemakerStore = this.nhDelegate.sensemakerStore;
      console.log("Delegate", this.nhDelegate)
      const appletRoleName = "todo_lists";
      const cellInfo = this.nhDelegate.appInfo.cell_info[appletRoleName][0]
      const cellId = getCellId(cellInfo);
      const installAppId = this.nhDelegate.appInfo.installed_app_id;
      appletConfig.name = installAppId;
      this.todoStore = new TodoStore(
        this.nhDelegate.appAgentWebsocket,
        cellId!,
        appletRoleName
      );

      this.todoStore.fetchAllTasks()
      // console.log(allTasks)
      const allTaskEntryHashes = get(this.todoStore.allTaskEntryHashes())
      // console.log(allTaskEntryHashes)
      await this.nhDelegate.sensemakerStore.getAssessmentsForResources({
        resource_ehs: allTaskEntryHashes
      })
      console.log('got assessments');
      this.loaded = true;
    }
    catch (e) {
      console.log("error in first update", e)
    }
  }

  render() {
    // console.log("In the render")

    console.log("Render", `loaded is ${this.loaded}`)
    if (!this.loaded) {
      console.log("Rendering loading screen")
      return html`
      <div style="display: flex; flex: 1; flex-direction: row; align-items: center; justify-content: center">
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`;
    }

    // the task list component is also used to display a cultural context, so we need to pass a flag to it
    // TODO: instead of having one task-list component, might be best to have separate ones - context view, empty list, etc. and just pass through the list itself
    const taskList = html`
      <div class="task-list-header">${this.activeList}</div>
      <task-list .listName=${this.activeList} .todoStore=${this.todoStore} .sensemakerStore=${this.sensemakerStore}></task-list>
    `;

    const contextResult = html`
      <div class="task-list-header">${this.activeContext}</div>
      <context-view contextName=${this.activeContext} .todoStore=${this.todoStore} .sensemakerStore=${this.sensemakerStore}></context-view>
    `;

    return html`
      <main>
        <div class="home-page">
          <div class="view-selectors">
            <div class="top-elements">
              <div class="view-selector-heading">Lists</div>
              <div class="list-list-container">
                <mwc-list @list-selected=${this.updateActiveList}>
                    ${this.lists?.value?.map((listName) => html`
                        <list-item class="todo-list-list-item" listName=${listName}></list-item>
                    `)}
                </mwc-list>
              </div>
              <div class="view-selector-heading">Data Views</div>
              <context-selector .appId=${this.nhDelegate.appInfo.installed_app_id} .sensemakerStore=${this.sensemakerStore} @list-selected=${this.computeContext}></context-selector>
            </div>
            <div class="bottom-elements">
              <add-item itemType="list" @new-item=${this.addNewList}></add-item>
            </div>
          </div>
          <div class="view">
            ${this.activeContext ? contextResult : taskList}
              <add-item itemType="task" @new-item=${this.addNewTask}></add-item>
          </div>
          <mwc-checkbox @click=${this.toggleDefaultUISettings}></mwc-checkbox>
        </div>
      </main>
    `;
  }

  async addNewList(e: CustomEvent) {
      await this.todoStore.createNewList(e.detail.newValue)
      this.activeList = e.detail.newValue;
      this.activeContext = undefined;
  }
  async addNewTask(e: CustomEvent) {
      console.log('adding new item', e.detail.newValue)
      const createdTask = await this.todoStore.addTaskToList({
        task_description: e.detail.newValue,
        list: this.activeList!,
      })
          const options = {
              detail: { hash: createdTask.entry_hash },
              bubbles: true,
              composed: true
          };
      this.dispatchEvent(new CustomEvent('task-hash-created', options))
  }
  // handle the @list-selected event from the list-list component
  updateActiveList(e: CustomEvent) {
    this.activeList = e.detail.selectedList;
    this.activeContext = undefined;
  }

  // whenever the IMPORTANT TASKS view is selected, we recompute the context by passing it all the task entry hashes
  // TODO: decouple context selection from context computation
  async computeContext(e: CustomEvent) {
    const selectedContextName = e.detail.selectedList;
    const contextResultInput: ComputeContextInput = {
      resource_ehs: get(this.todoStore.allTaskEntryHashes()),
      context_eh: decodeHashFromBase64(getHashesFromNames([selectedContextName], get(this.sensemakerStore.contexts).get(this.nhDelegate.appInfo.installed_app_id)!)[0]),
      can_publish_result: false,
    }
    const contextResult = await this.sensemakerStore.computeContext(selectedContextName, contextResultInput)
    console.log('context result', contextResult)
    this.activeContext = selectedContextName;
  }

  toggleDefaultUISettings() {
    if (this.defaultUISettings) {
      this.sensemakerStore.updateActiveMethod(
        getHashesFromResourceDefNames(["task_item"], get(this.sensemakerStore.resourceDefinitions))[0],
        getHashesFromNames(["Votes_method"], get(this.sensemakerStore.methods))[0],
      )
    }
    else {
      this.sensemakerStore.updateActiveMethod(
        getHashesFromResourceDefNames(["task_item"], get(this.sensemakerStore.resourceDefinitions))[0],
        getHashesFromNames(["Priority_level_method"], get(this.sensemakerStore.methods))[0],
      )
    }
    this.defaultUISettings = !this.defaultUISettings;
  }

  static get elementDefinitions() {
    return {
      'task-list': TaskList,
      "mwc-circular-progress": CircularProgress,
      'context-selector': ContextSelector,
      'context-view': ContextView,
      'mwc-checkbox': Checkbox,
      'add-item': AddItem,
      'task-item': TaskItem,
      'mwc-list': List,
      'list-item': ListItem,
    };
  }

    static get styles() {
        return [
            variables,
            css`
            .home-page {
              display: flex;
              flex-direction: row;
              background-color: var(--nh-theme-bg-canvas);
              color: var(--nh-theme-fg-default);
              width: 100%;
              height: 99%;
            }

            :host {
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              font-size: calc(10px + 2vmin);
              color: var(--nh-theme-fg-default);
              margin:  0px;
              text-align: center;
              background-color: var(--lit-element-background-color);
              --mdc-ripple-color: var(--nh-theme-accent-muted);
              --mdc-ripple-hover-opacity: 0.2;
              --mdc-ripple-press-opacity: 0.5;
              --mdc-ripple-fg-opacity: var(--mdc-ripple-press-opacity, 0.12);
            }

            main {
              flex-grow: 1;
              width: 100%;
              background-color: var(--nh-theme-bg-canvas);
              padding-bottom: 76px;
            }

            .app-footer {
              font-size: calc(12px + 0.5vmin);
              align-items: center;
            }

            .app-footer a {
              margin-left: 5px;
            }

            .view-selectors {
                display: flex;
                flex-direction: column;
                background-color: var(--nh-theme-bg-surface);
                width: 300px;
                border-radius: var(--border-r-tiny);
                margin: 4px;
                margin-top: 6px;
                height: 100%;
                position: relative;
                justify-content: space-between;
                padding: 8px;
                box-sizing: border-box;
            }
            .view-selector-heading {
              text-align: center;
              display: flex;
              justify-content: center;
            }
            .task-list-header {
                width: 99%;
                height: 58px;
                background-color: var(--nh-theme-accent-muted);
                border-radius: var(--border-r-tiny);
                margin: 4px;
                margin-top: 6px;
                margin-right: -16px;
                align-items: center;
                justify-content: center;
                display: flex;
                font-size: 20px;
            }

            .list-list-container {
              display: flex;
              flex-direction: column;
              width: 100%;
            }
            .todo-list-list-item:hover {
                background-color: var(--nh-theme-accent-muted);
            }

            .view {
              width: 620px;
              justify-content: space-between;
              display: flex;
              flex-direction: column;
              padding: 8px;
            }
            task-list, context-view {
              height: 100%;
            }
            .top-elements, .bottom-elements, .view-selector-heading {
              display: flex;
            }
            .top-elements {
              flex-direction: column;
            }
            .top-elements > *, .bottom-elements > * {
              display: flex;
              width: 100%;
            }
            .bottom-elements {
              margin-bottom: 8px;
            }
            context-view + add-item {
              display: none;
            }
            `
        ]
    }
}
