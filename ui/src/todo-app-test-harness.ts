import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  AppWebsocket,
  ActionHash,
  AppInfo,
  AdminWebsocket,
  InstalledCell,
  encodeHashToBase64,
  CellInfo,
  Cell,
  AppAgentWebsocket,
} from '@holochain/client';
import '@material/mwc-circular-progress';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { get } from 'svelte/store';
import { TodoStore } from './todo-store';
import { SensemakerService, SensemakerStore } from '@neighbourhoods/nh-we-applet';
import { TodoApp } from './index';
import appletConfig from './appletConfig'

@customElement('todo-app-test-harness')
export class TodoAppTestHarness extends ScopedElementsMixin(LitElement) {
  @state() loading = true;
  @state() actionHash: ActionHash | undefined;
  @state() currentSelectedList: string | undefined;

  @property({ type: Object })
  appWebsocket!: AppWebsocket;

  @property({ type: Object })
  adminWebsocket!: AdminWebsocket;

  @property({ type: Object })
  appInfo!: AppInfo;

  @property()
  _todoStore!: TodoStore;

  @property()
  _sensemakerStore!: SensemakerStore;


  async firstUpdated() {
    // connect to holochain conductor and set up websocket connections
    try {
      await this.connectHolochain()
      const installedCells = this.appInfo.cell_info;
      
      // check if sensemaker has been cloned yet
      let clonedSensemakerCell: InstalledCell | undefined
      let clonedSensemakerRoleName: string
      const sensemakerCellInfo: CellInfo[] = installedCells["sensemaker"];
      const todoCellInfo: CellInfo[] = installedCells["todo_lists"];
      const todoCellId = (todoCellInfo[0] as { "Provisioned": Cell }).Provisioned.cell_id;

      // check if the cell has been cloned yet
      if (sensemakerCellInfo.length == 1) {
        const sensemakerCell = (sensemakerCellInfo[0] as { "Provisioned": Cell }).Provisioned;

        clonedSensemakerCell = await this.appWebsocket.createCloneCell({
          app_id: 'todo-sensemaker',
          role_name: "sensemaker",
          modifiers: {
            network_seed: '',
            properties: {
              community_activator: encodeHashToBase64(sensemakerCell.cell_id[1])
            },
            origin_time: Date.now(),
          },
          name: 'sensemaker-clone',
        });
        clonedSensemakerRoleName = clonedSensemakerCell.role_name;
      }
      else {
        const clonedCellInfo = sensemakerCellInfo.filter((cellInfo) => "Cloned" in cellInfo)[0]
        const cell = (clonedCellInfo as { "Cloned": Cell }).Cloned!;
        clonedSensemakerRoleName = cell.clone_id!;
      }
      const appAgentWebsocket: AppAgentWebsocket = await AppAgentWebsocket.connect(this.appWebsocket, "todo-sensemaker");
      const sensemakerService = new SensemakerService(appAgentWebsocket, clonedSensemakerRoleName)
      this._sensemakerStore = new SensemakerStore(sensemakerService);

      await this._sensemakerStore.registerApplet(appletConfig)

      this._todoStore = new TodoStore(
        this.appWebsocket,
        todoCellId,
        "todo_lists"
      );
      const allTasks = await this._todoStore.fetchAllTasks()
      await this.updateSensemakerState()
      this.loading = false;
    }
    catch (e) {
      console.log("error registering applet", e)
    }
  }

  render() {
    if (this.loading)
      return html`
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      `;
    return html`
      <main>
        <div class="home-page">
          <todo-app .sensemakerStore=${this._sensemakerStore} .todoStore=${this._todoStore}></todo-app>
        </div>
      </main>
    `;
  }

  async connectHolochain() {
    this.adminWebsocket = await AdminWebsocket.connect(``);
    this.appWebsocket = await AppWebsocket.connect(``);

    this.appInfo = await this.appWebsocket.appInfo({
      installed_app_id: 'todo',
    });
  }

  // attempt to fetch assessments for each task to have an up-to-date sensemaker state (currently just of assessments)
  async updateSensemakerState() {
    const allTaskEntryHashes = get(this._todoStore.allTaskEntryHashes())
    const dimensionEh = get(this._sensemakerStore.appletConfig()).dimensions["importance"]
    for (const taskEh of allTaskEntryHashes) {
      await this._sensemakerStore.getAssessmentForResource({
        dimension_eh: dimensionEh,
        resource_eh: taskEh
      })
    }
  }

  static get scopedElements() {
    return {
      'todo-app': TodoApp,
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
