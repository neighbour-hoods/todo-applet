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

import { appWebsocketContext, appInfoContext, adminWebsocketContext, todoStoreContext, sensemakerStoreContext } from './contexts';
import { TodoStore } from './todo-store';
import { Dimension, SensemakerService, SensemakerStore } from '@lightningrodlabs/we-applet';
import { serializeHash } from '@holochain-open-dev/utils';
import { ListList, TaskList } from './index'
import { get } from 'svelte/store';

export class TodoAppTestHarness extends ScopedElementsMixin(LitElement) {
  @state() loading = true;
  @state() actionHash: ActionHash | undefined;
  @state() currentSelectedList: string | undefined;

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

  @contextProvider({ context: sensemakerStoreContext })
  @property()
  _sensemakerStore!: SensemakerStore;

  @state()
  activeList: string | undefined

  async firstUpdated() {
    await this.connectHolochain()

    const installedCells = this.appInfo.cell_data;
    await this.initializeSensemaker(installedCells)

    const todoCell = installedCells.find(
      c => c.role_id === 'todo_lists'
    ) as InstalledCell;
    console.log("todo cell", todoCell)

    this._todoStore = new TodoStore(
        new HolochainClient(this.appWebsocket),
        todoCell
    );
    await this._todoStore.fetchAllTasks()
    this.loading = false;
  }

  render() {
    if (this.loading)
      return html`
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      `;
    const taskList = html`
      <task-list listName=${this.activeList}></task-list>
    ` 

    return html`
      <main>
        <div class="home-page">
          <list-list @list-selected=${this.updateActiveList}></list-list>
          ${taskList}
        </div>
      </main>
    `;
  }

  async connectHolochain() {
    this.adminWebsocket = await AdminWebsocket.connect(
      `ws://localhost:${process.env.HC_ADMIN_PORT}`
    );

    this.appWebsocket = await AppWebsocket.connect(
      `ws://localhost:${process.env.HC_PORT}`
    );
    

    this.appInfo = await this.appWebsocket.appInfo({
      installed_app_id: 'todo',
    });
  }

  async initializeSensemaker(installedCells: InstalledCell[]) {
    const client = new HolochainClient(this.appWebsocket);
    const sensemakerCell = installedCells.find(
      c => c.role_id === 'sensemaker'
    ) as InstalledCell;
    console.log("sensemaker cell", sensemakerCell)

    const clonedSensemakerCell = await this.appWebsocket.createCloneCell({
      app_id: 'todo',
      role_id: "sensemaker",
      modifiers: {
        network_seed: '',
        properties: {
          community_activator: serializeHash(sensemakerCell.cell_id[1])
        },
        origin_time: Date.now(),
      },
      name: 'sensemaker-clone',
    });
    const sensemakerCellClient = new CellClient(client, clonedSensemakerCell);
    this._sensemakerStore = new SensemakerStore(
      new SensemakerService(sensemakerCellClient)
    );


    const integerRange = {
      "name": "10-scale",
      "kind": {
        "Integer": { "min": 0, "max": 10 }
      },
    };

    const dimension: Dimension = {
      name: "test",
      range: integerRange
    }
    const dimensionHash = await this._sensemakerStore.createDimension(dimension)
    console.log('dimension hash', dimensionHash)

  }
  updateActiveList(e: CustomEvent) {
    this.activeList = e.detail.selectedList;
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
