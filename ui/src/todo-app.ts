import { LitElement, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { contextProvider } from '@lit-labs/context';
import '@material/mwc-circular-progress';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';

import { todoStoreContext, sensemakerStoreContext } from './contexts';
import { TodoStore } from './todo-store';
import { ComputeContextInput, SensemakerStore } from '@lightningrodlabs/we-applet';
import { addMyAssessmentsToTasks, AppletConfig, ListList, TaskList } from './index'
import { get } from 'svelte/store';

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
  contextSelected: boolean = false

  async firstUpdated() {
  }

  render() {
    const taskList = html`
      <task-list listName=${this.activeList} .isContext=${this.contextSelected}></task-list>
    ` 

    return html`
      <main>
        <div class="home-page">
          <list-list @list-selected=${this.updateActiveList} @context-selected=${this.computeContext}></list-list>
          ${taskList}
        </div>
      </main>
    `;
  }

  updateActiveList(e: CustomEvent) {
    this.activeList = e.detail.selectedList;
    this.contextSelected = false;
  }

  async computeContext(_e: CustomEvent) {
    const contextResultInput: ComputeContextInput = {
      resource_ehs: get(this.todoStore.allTaskEntyHashes()),
      context_eh: get(this.sensemakerStore.appletConfig()).contexts["most_important_tasks"],
      can_publish_result: false,
    }
    const contextResult = await this.sensemakerStore.computeContext("most_important_tasks", contextResultInput)
    console.log('context result', contextResult)
    this.contextSelected = true;
  }

  static get scopedElements() {
    return {
      'list-list': ListList,
      'task-list': TaskList,
    };
  }

  static styles = css`
    .home-page {
      display: flex;
      flex-direction: row;
    }  

    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      background-color: var(--lit-element-background-color);
    }

    main {
      flex-grow: 1;
    }

    .app-footer {
      font-size: calc(12px + 0.5vmin);
      align-items: center;
    }

    .app-footer a {
      margin-left: 5px;
    }
  `;
}