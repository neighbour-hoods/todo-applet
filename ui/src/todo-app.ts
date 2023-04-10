import { LitElement, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { contextProvider } from '@lit-labs/context';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';

import { todoStoreContext, sensemakerStoreContext } from './contexts';
import { TodoStore } from './todo-store';
import { ComputeContextInput, SensemakerStore } from '@neighbourhoods/client';
import { ListList, TaskList } from './index'
import { get } from 'svelte/store';
import { ContextSelector } from './components/context-selector';
import { ContextView } from './components/context-view';

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

  async firstUpdated() {
  }

  render() {
    // the task list component is also used to display a cultural context, so we need to pass a flag to it
    // TODO: instead of having one task-list component, might be best to have separate ones - context view, empty list, etc. and just pass through the list itself
    const taskList = html`
      <task-list listName=${this.activeList}></task-list>
    `;

    const contextResult = html`
      <context-view contextName=${this.activeContext}></context-view>
    `;

    return html`
      <main>
        <div class="home-page">
          <div class="view-selectors">
            <context-selector @list-selected=${this.computeContext}></context-selector>
            <list-list @list-selected=${this.updateActiveList}></list-list>
          </div>
          <div class="view">
            ${this.activeContext ? contextResult : taskList}
          </div>
        </div>
      </main>
    `;
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

  static get scopedElements() {
    return {
      'list-list': ListList,
      'task-list': TaskList,
      'context-selector': ContextSelector,
      'context-view': ContextView,
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

    .view-selectors {
        display: flex;
        flex-direction: column;
    }
  `;
}
