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
  ProvisionedCell,
  CellType,
  CellId,
  ClonedCell,
} from '@holochain/client';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { TodoStore } from './todo-store';
import { CreateOrJoinNH } from '@neighbourhoods/dev-util-components';
import {
  SensemakerStore,
} from '@neighbourhoods/client';
import { INSTALLED_APP_ID, appletConfig } from './appletConfig'
import TodoApplet from './applet-index'
import './components/task-display-wrapper'
import {
  connectHolochainApp,
  getAppAgentWebsocket,
  createAppDelegate,
  AppBlockRenderer
} from "@neighbourhoods/app-loader"
import { CircularProgress } from '@scoped-elements/material-web';

@customElement('applet-test-harness')
export class AppletTestHarness extends ScopedRegistryHost(LitElement) {
  @state() loading = true;
  @state() actionHash: ActionHash | undefined;
  @state() currentSelectedList: string | undefined;

  @property({ type: Object })
  appWebsocket!: AppWebsocket;

  @property({ type: Object })
  adminWebsocket!: AdminWebsocket;

  @property()
  appInfo!: AppInfo;

  @property()
  _todoStore!: TodoStore;

  @property()
  _sensemakerStore!: SensemakerStore;

  @property()
  isSensemakerCloned: boolean = false;

  @property()
  agentPubkey!: string;

  @state()
  taskHash?: ActionHash;

  appAgentWebsocket!: AppAgentWebsocket;


  async firstUpdated() {
    // connect to holochain conductor and set up websocket connections
    try {
      const {
        adminWebsocket,
        appWebsocket,
        appInfo
      } = await connectHolochainApp(INSTALLED_APP_ID);
      const installedCells = appInfo.cell_info

      this.adminWebsocket = adminWebsocket
      this.appWebsocket = appWebsocket
      this.appInfo = appInfo
      // check if sensemaker has been cloned yet
      const sensemakerCellInfo: CellInfo[] = installedCells["sensemaker"];
      if (sensemakerCellInfo.length > 1) {
        this.isSensemakerCloned = true;
        const clonedSMCellId = (sensemakerCellInfo[1] as { cloned: ClonedCell }).cloned.clone_id;
        await this.initializeSensemakerStore(clonedSMCellId);
        this.loading = false;
      }
      const todoCellInfo: CellInfo[] = installedCells["todo_lists"];
      let todoCellId: CellId;
      if (CellType.Provisioned in todoCellInfo[0]) {
        todoCellId = (todoCellInfo[0][CellType.Provisioned] as ProvisionedCell).cell_id;
      } else {
        throw new Error("todo_lists cell not provisioned yet")

      }
      this.agentPubkey = encodeHashToBase64(todoCellId[1]);
    }
    catch (e) {
      console.log("error registering applet", e)
    }
  }

  async initializeSensemakerStore(clonedSensemakerRoleName: string) {
    const appAgentWebsocket = await getAppAgentWebsocket(INSTALLED_APP_ID);
    this.appAgentWebsocket = appAgentWebsocket;
    this._sensemakerStore = new SensemakerStore(appAgentWebsocket, clonedSensemakerRoleName);
    await this._sensemakerStore.registerApplet(TodoApplet.appletConfig)
  }
  async cloneSensemakerCell(ca_pubkey: string) {
    const clonedSensemakerCell: ClonedCell = await this.appWebsocket.createCloneCell({
      app_id: INSTALLED_APP_ID,
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
    await this.adminWebsocket.authorizeSigningCredentials(clonedSensemakerCell.cell_id);
    await this.initializeSensemakerStore(clonedSensemakerCell.clone_id)
  }

  async createNeighbourhood(_e: CustomEvent) {
    await this.cloneSensemakerCell(this.agentPubkey)
    const _todoConfig = await this._sensemakerStore.registerApplet(appletConfig);
console.log('_todoConfig :>> ', _todoConfig);
    this.loading = false;
  }

  async joinNeighbourhood(e: CustomEvent) {
    await this.cloneSensemakerCell(e.detail.newValue)
    // wait some time for the dht to sync, otherwise checkIfAppletConfigExists returns null
    setTimeout(async () => {
      const _todoConfig = await this._sensemakerStore.registerApplet(appletConfig);
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
    const delegate = createAppDelegate(
      this.appAgentWebsocket,
      this.appInfo,
      {
        logoSrc: "",
        name: ""
      },
      this._sensemakerStore
    )
    return html`
      <main>
        <h3>My Pubkey: ${this.agentPubkey}</h3>
        <div class="home-page"
          @task-hash-created=${(e: CustomEvent) => { console.log('task created with hash:', e.detail.hash); this.taskHash = e.detail.hash }}
        >
        <app-renderer .component=${TodoApplet.appletRenderers['full']} .nhDelegate=${delegate}></app-renderer>
        </div>
      </main>
    `;
  }

  static get elementDefinitions() {
    return {
      'create-or-join-nh': CreateOrJoinNH,
      'app-renderer': AppBlockRenderer,
      'mwc-circular-progress': CircularProgress,
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
