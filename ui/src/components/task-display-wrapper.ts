import { contextProvided } from '@lit-labs/context';
import { customElement, property, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { LitElement, html, css, PropertyValueMap } from 'lit';
import { Task, WrappedEntry, WrappedTaskWithAssessment } from '../types';
import {
  Checkbox,
  ListItem,
  CheckListItem,
} from '@scoped-elements/material-web';
import { sensemakerStoreContext, todoStoreContext } from '../contexts';
import { SensemakerStore } from '@neighbourhoods/client';
import { TodoStore } from '../todo-store';
import { variables } from '../styles/variables';
import {
  ActionHash,
  AppAgentCallZomeRequest,
  AppAgentClient,
  EntryHash,
} from '@holochain/client';
import { TaskItem } from './task-item';
import {
  NHDelegateReceiver,
  ResourceBlockDelegate,
} from '@neighbourhoods/nh-launcher-applet';

@customElement('task-display-wrapper')
export class TaskDisplayWrapper
  extends ScopedElementsMixin(LitElement)
  implements NHDelegateReceiver<ResourceBlockDelegate>
{
  @property()
  resourceHash!: EntryHash;

  @property()
  appAgentWebsocket!: AppAgentClient;

  @state()
  fetchingResource = true;

  task?: WrappedEntry<Task>;
  private _delegate: ResourceBlockDelegate | null = null;
  connectedCallback() {
    this._setupComponent();
  }
  set nhDelegate(delegate: ResourceBlockDelegate) {
    this._delegate = delegate;
    this._setupComponent();
  }
  async _setupComponent() {
    if (this._delegate) {
      const appAgentWebsocket = this._delegate.appAgentWebsocket;
      this.appAgentWebsocket = appAgentWebsocket;

      const req: AppAgentCallZomeRequest = {
        cap_secret: null,
        role_name: 'todo_lists',
        zome_name: 'todo',
        fn_name: 'get_latest_task_with_eh',
        payload: this.resourceHash,
      };
      const task = await this.appAgentWebsocket.callZome(req);
      this.task = {
        entry: task,
        entry_hash: this.resourceHash,
        action_hash: this.resourceHash,
      };
      this.fetchingResource = false;
    }
  }

  render() {
    if (this.fetchingResource)
      return html`<mwc-circular-progress></mwc-circular-progress>`;
    else {
      return html` <task-item .task=${this.task}></task-item> `;
    }
  }

  static get scopedElements() {
    return {
      'task-item': TaskItem,
    };
  }
}
