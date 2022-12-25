import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  AppWebsocket,
  ActionHash,
  InstalledAppInfo,
  AdminWebsocket,
  InstalledCell,
} from '@holochain/client';
import { contextProvider } from '@lit-labs/context';
import '@material/mwc-circular-progress';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { HolochainClient, CellClient } from '@holochain-open-dev/cell-client';

import { appWebsocketContext, appInfoContext, adminWebsocketContext, todoStoreContext } from './contexts';
import { TodoStore } from './todo-store';

export class TodoAppTestHarness extends ScopedElementsMixin(LitElement) {
  @state() loading = true;
  @state() actionHash: ActionHash | undefined;

  @contextProvider({ context: appWebsocketContext })
  @property({ type: Object })
  appWebsocket!: AppWebsocket;

  @contextProvider({ context: adminWebsocketContext })
  @property({ type: Object })
  adminWebsocket!: AdminWebsocket;

  @contextProvider({ context: appInfoContext })
  @property({ type: Object })
  appInfo!: InstalledAppInfo;

  @contextProvider({ context: todoStoreContext })
  @property()
  _todoStore!: TodoStore;

  async firstUpdated() {
    this.adminWebsocket = await AdminWebsocket.connect(
      `ws://localhost:${process.env.HC_ADMIN_PORT}`
    );

    this.appWebsocket = await AppWebsocket.connect(
      `ws://localhost:${process.env.HC_PORT}`
    );
    

    this.appInfo = await this.appWebsocket.appInfo({
      installed_app_id: 'todo',
    });

    const client = new HolochainClient(this.appWebsocket);

    const appInfo = await this.appWebsocket.appInfo({
      installed_app_id: 'todo',
    });

    const installedCells = appInfo.cell_data;
    const todoCell = installedCells.find(
      c => c.role_id === 'todo_lists'
    ) as InstalledCell;

    const cellClient = new CellClient(client, todoCell);

    this._todoStore = new TodoStore(
        new HolochainClient(this.appWebsocket),
        todoCell
      );

    await this._todoStore.createNewList("groceries")
    await this._todoStore.addTaskToList({
      task_description: "apples",
      list: "groceries"
    })
    const allTasks = await this._todoStore.fetchAllTasks()
    console.log('all tasks', allTasks)
    this.loading = false;
  }

  render() {
    if (this.loading)
      return html`
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      `;

    return html`
      <main>
        <h1>todo</h1>

    ${this.actionHash ? html`
    ` : html``}
      </main>
    `;
  }

  static styles = css`
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
