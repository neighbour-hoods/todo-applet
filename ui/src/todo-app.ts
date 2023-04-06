import { LitElement, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { contextProvider } from '@lit-labs/context';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';

import { todoStoreContext, sensemakerStoreContext } from './contexts';
import { TodoStore } from './todo-store';
// import { SensemakerStore } from '@neighbourhoods/nh-we-applet';
import { ComputeContextInput, SensemakerStore } from '@neighbourhoods/client';
import { ListList, TaskList } from './index'
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
    // the task list component is also used to display a cultural context, so we need to pass a flag to it
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

  // handle the @list-selected event from the list-list component
  updateActiveList(e: CustomEvent) {
    this.activeList = e.detail.selectedList;
    this.contextSelected = false;
  }

  // whenever the IMPORTANT TASKS view is selected, we recompute the context by passing it all the task entry hashes
  async computeContext(_e: CustomEvent) {
    const contextResultInput: ComputeContextInput = {
      resource_ehs: get(this.todoStore.allTaskEntryHashes()),
      context_eh: get(this.sensemakerStore.appletConfig()).cultural_contexts["most_important_tasks"],
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
