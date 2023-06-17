import { LitElement, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { contextProvider } from '@lit-labs/context';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';

import { todoStoreContext, sensemakerStoreContext } from './contexts';
import { TodoStore } from './todo-store';
import { ComputeContextInput, SensemakerStore } from '@neighbourhoods/client';
import { ListList, TaskList } from './index'
import { get } from 'svelte/store';
import { ContextSelector } from './components/sensemaker/context-selector';
import { ContextView } from './components/sensemaker/context-view';
import { Checkbox } from '@scoped-elements/material-web'
import { encodeHashToBase64 } from '@holochain/client';
import { variables } from './styles/variables';
import { AddItem } from './components/add-item';

export class TodoApp extends ScopedElementsMixin(LitElement) {
  @contextProvider({ context: todoStoreContext })
  @property()
  todoStore!: TodoStore;

  @contextProvider({ context: sensemakerStoreContext })
  @property()
  sensemakerStore!: SensemakerStore;

  @state()
  activeList: string | undefined

  @state()
  activeContext: string | undefined

  @state()
  defaultUISettings = true

  async firstUpdated() {
  }

  render() {
    // the task list component is also used to display a cultural context, so we need to pass a flag to it
    // TODO: instead of having one task-list component, might be best to have separate ones - context view, empty list, etc. and just pass through the list itself
    const taskList = html`
      <div class="task-list-header">${this.activeList}</div>
      <task-list listName=${this.activeList}></task-list>
    `;

    const contextResult = html`
      <div class="task-list-header">${this.activeContext}</div>
      <context-view contextName=${this.activeContext}></context-view>
    `;

    return html`
      <main>
        <div class="home-page">
          <mwc-checkbox @click=${this.toggleDefaultUISettings}></mwc-checkbox>
          <div class="view-selectors">
            <div class="view-selector-heading">Lists</div>
            <list-list @list-selected=${this.updateActiveList}></list-list>
            <div class="view-selector-heading">Sensemaker Contexts</div>
            <context-selector @list-selected=${this.computeContext}></context-selector>
            <add-item itemType="list" @new-item=${this.addNewList}></add-item>
          </div>
          <div class="view">
            ${this.activeContext ? contextResult : taskList}
            ${this.activeContext ? null : html`
              <add-item itemType="task" @new-item=${this.addNewTask}></add-item>
            `}

          </div>
        </div>
      </main>
    `;
  }

  async addNewList(e: CustomEvent) {
      await this.todoStore.createNewList(e.detail.newValue)
  }
  async addNewTask(e: CustomEvent) {
      console.log('adding new item', e.detail.newValue)
      await this.todoStore.addTaskToList({
      task_description: e.detail.newValue,
      list: this.activeList!,
  })
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
      context_eh: get(this.sensemakerStore.appletConfig()).cultural_contexts[selectedContextName],
      can_publish_result: false,
    }
    const contextResult = await this.sensemakerStore.computeContext(selectedContextName, contextResultInput)
    console.log('context result', contextResult)
    this.activeContext = selectedContextName;
  }

  toggleDefaultUISettings() {
    if (this.defaultUISettings) {
      this.sensemakerStore.updateActiveMethod(
        encodeHashToBase64(get(this.sensemakerStore.appletConfig()).resource_defs["task_item"]),
        encodeHashToBase64(get(this.sensemakerStore.appletConfig()).methods["average_heat_method"]),
      )
    }
    else {
      this.sensemakerStore.updateActiveMethod(
        encodeHashToBase64(get(this.sensemakerStore.appletConfig()).resource_defs["task_item"]),
        encodeHashToBase64(get(this.sensemakerStore.appletConfig()).methods["total_importance_method"]),
      )
    }
    this.defaultUISettings = !this.defaultUISettings;
  }

  static get scopedElements() {
    return {
      'list-list': ListList,
      'task-list': TaskList,
      'context-selector': ContextSelector,
      'context-view': ContextView,
      'mwc-checkbox': Checkbox,
      'add-item': AddItem,
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
            }
        
            main {
              flex-grow: 1;
              width: 100%;
              background-color: var(--nh-theme-bg-canvas);
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
            }
            add-item {
              position: absolute;
              bottom: 0px;
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
            .view {
              width: 620px;
              position: relative;
            }
            task-list {
              height: 100%;
            }
            `
        ]
    }
}
