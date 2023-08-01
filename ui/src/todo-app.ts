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
          <div class="view-selectors">
            <div class="top-elements">
              <div class="view-selector-heading">Lists</div>
              <list-list @list-selected=${this.updateActiveList}></list-list>
              <div class="view-selector-heading">Sensemaker Contexts</div>
              <context-selector @list-selected=${this.computeContext}></context-selector>
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
      context_eh: get(this.sensemakerStore.flattenedAppletConfigs()).cultural_contexts[selectedContextName],
      can_publish_result: false,
    }
    const contextResult = await this.sensemakerStore.computeContext(selectedContextName, contextResultInput)
    console.log('context result', contextResult)
    this.activeContext = selectedContextName;
  }

  toggleDefaultUISettings() {
    if (this.defaultUISettings) {
      this.sensemakerStore.updateActiveMethod(
        encodeHashToBase64(get(this.sensemakerStore.flattenedAppletConfigs()).resource_defs["task_item"]),
        encodeHashToBase64(get(this.sensemakerStore.flattenedAppletConfigs()).methods["average_heat_method"]),
      )
    }
    else {
      this.sensemakerStore.updateActiveMethod(
        encodeHashToBase64(get(this.sensemakerStore.flattenedAppletConfigs()).resource_defs["task_item"]),
        encodeHashToBase64(get(this.sensemakerStore.flattenedAppletConfigs()).methods["total_importance_method"]),
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
