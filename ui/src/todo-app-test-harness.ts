import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  AppWebsocket,
  ActionHash,
  AppInfo,
  AdminWebsocket,
  encodeHashToBase64,
  CellInfo,
  AppAgentWebsocket,
  InstalledCell,
  ProvisionedCell,
  CellType,
  CellId,
  ClonedCell,
} from '@holochain/client';
import '@material/mwc-circular-progress';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { get } from 'svelte/store';
import { TodoStore } from './todo-store';
import { CreateOrJoinNh } from './create-or-join-nh';
import { SensemakerService, SensemakerStore } from '@neighbourhoods/client';
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

  @property()
  isSensemakerCloned: boolean = false;

  @property()
  agentPubkey!: string;


  async firstUpdated() {
    // connect to holochain conductor and set up websocket connections
    try {
      await this.connectHolochain()
      const installedCells = this.appInfo.cell_info;

      // check if sensemaker has been cloned yet
      const sensemakerCellInfo: CellInfo[] = installedCells["sensemaker"];
      const todoCellInfo: CellInfo[] = installedCells["todo_lists"];
      let todoCellId: CellId;
      if (CellType.Provisioned in todoCellInfo[0]) {
        todoCellId = (todoCellInfo[0][CellType.Provisioned] as ProvisionedCell).cell_id;
      } else {
        throw new Error("todo_lists cell not provisioned yet")

      }
      this.agentPubkey = encodeHashToBase64(todoCellId[1]);

      this._todoStore = new TodoStore(
        this.appWebsocket,
        todoCellId,
        "todo_lists"
      );
      const allTasks = await this._todoStore.fetchAllTasks()
      // check if the cell has been cloned yet
      if (sensemakerCellInfo.length > 1) {
        console.log('already cloned')
        this.isSensemakerCloned = true;
        const clonedCellInfo = sensemakerCellInfo.filter((cellInfo) => CellType.Cloned in cellInfo)[0];
        let clonedCell: ClonedCell;
        if (CellType.Cloned in clonedCellInfo) {
          clonedCell = clonedCellInfo[CellType.Cloned];
        } else {
          throw new Error("cloned todo cell not found")
        }
        const clonedSensemakerRoleName = clonedCell.clone_id!;
        await this.initializeSensemakerStore(clonedSensemakerRoleName);
        await this.updateSensemakerState()
        this.loading = false;
      }
    }
    catch (e) {
      console.log("error registering applet", e)
    }
  }

  async initializeSensemakerStore(clonedSensemakerRoleName: string) {
    const appAgentWebsocket: AppAgentWebsocket = await AppAgentWebsocket.connect(``, "todo-sensemaker");
    const sensemakerService = new SensemakerService(appAgentWebsocket, clonedSensemakerRoleName)
    this._sensemakerStore = new SensemakerStore(sensemakerService);
  }
  async cloneSensemakerCell(ca_pubkey: string) {
    const clonedSensemakerCell: ClonedCell = await this.appWebsocket.createCloneCell({
      app_id: 'todo-sensemaker',
      role_name: "sensemaker",
      modifiers: {
        network_seed: '',
        properties: {
          sensemaker_config: {
            neighbourhood: "todo test",
            wizard_version: "v0.1",
            community_activator: ca_pubkey
          },
          applet_configs: [],
        },
    }});
    this.isSensemakerCloned = true;
    await this.initializeSensemakerStore(clonedSensemakerCell.clone_id)
  }

  async createNeighbourhood(_e: CustomEvent) {
    await this.cloneSensemakerCell(this.agentPubkey)
    const _todoConfig = await this._sensemakerStore.registerApplet(appletConfig);
    await this.updateSensemakerState()
    this.loading = false;
  }

  async joinNeighbourhood(e: CustomEvent) {
    await this.cloneSensemakerCell(e.detail.newValue)
    // wait some time for the dht to sync, otherwise checkIfAppletConfigExists returns null
    setTimeout(async () => {
      const _todoConfig = await this._sensemakerStore.checkIfAppletConfigExists("todo_applet")
      await this.updateSensemakerState()
      this.loading = false;
    }, 2000)
  }

  render() {
    if (this.isSensemakerCloned && this.loading)
      return html`
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      `;
    if (!this.isSensemakerCloned)
      return html`
        <create-or-join-nh @create-nh=${this.createNeighbourhood} @join-nh=${this.joinNeighbourhood}></create-or-join-nh>
      `;
    return html`
      <main>
        <h3>My Pubkey: ${this.agentPubkey}</h3>
        <div class="home-page">
          <todo-app .sensemakerStore=${this._sensemakerStore} .todoStore=${this._todoStore}></todo-app>
        </div>
      </main>
    `;
  }

  async connectHolochain() {
    this.adminWebsocket = await AdminWebsocket.connect(``);
    this.appWebsocket = await AppWebsocket.connect(``);
    // comment
    this.appInfo = await this.appWebsocket.appInfo({
      installed_app_id: 'todo',
    });
  }

  // attempt to fetch assessments for each task to have an up-to-date sensemaker state (currently just of assessments)
  async updateSensemakerState() {
    await this._sensemakerStore.checkIfAppletConfigExists("todo_applet")
    const allTaskEntryHashes = get(this._todoStore.allTaskEntryHashes())
    const dimensionEh = get(this._sensemakerStore.appletConfig()).dimensions["importance"]
    await this._sensemakerStore.getAssessmentsForResources({
      dimension_ehs: [dimensionEh],
      resource_ehs: allTaskEntryHashes
    })
    // for (const taskEh of allTaskEntryHashes) {
    //   await this._sensemakerStore.getAssessmentsForResources({
    //     dimension_ehs: [dimensionEh],
    //     resource_ehs: [taskEh]
    //   })
    // }
  }

  static get scopedElements() {
    return {
      'todo-app': TodoApp,
      'create-or-join-nh': CreateOrJoinNh,
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
