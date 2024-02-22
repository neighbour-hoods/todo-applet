import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';

import { AppWebsocket, AppInfo, AdminWebsocket, encodeHashToBase64, CellInfo, AppAgentWebsocket, ProvisionedCell, CellType, CellId, ClonedCell, } from '@holochain/client';

import { connectHolochainApp, getAppAgentWebsocket, createAppDelegate, AppBlockRenderer } from "@neighbourhoods/app-loader"
import { CreateOrJoinNH } from '@neighbourhoods/dev-util-components';
import { SensemakerStore, } from '@neighbourhoods/client';

import { CircularProgress } from '@scoped-elements/material-web';

import { TodoStore } from './todo-store';
import { INSTALLED_APP_ID, appletConfig } from './appletConfig'
import TodoApplet from './applet-index'

@customElement('applet-test-harness')
export class AppletTestHarness extends ScopedRegistryHost(LitElement) {
  @state() loading = true;
  @state() isSensemakerCloned: boolean = false;
  
  private _agentPubkey!: string;
  private _appWebsocket!: AppWebsocket;
  private _adminWebsocket!: AdminWebsocket;
  private _appAgentWebsocket!: AppAgentWebsocket;
  
  private _sensemakerStore!: SensemakerStore;
  private _appInfo!: AppInfo;

  async firstUpdated() {
    // connect to holochain conductor and set up websocket connections
    try {
      const {
        adminWebsocket,
        appWebsocket,
        appInfo
      } = await connectHolochainApp(INSTALLED_APP_ID);
      const installedCells = appInfo.cell_info

      this._adminWebsocket = adminWebsocket
      this._appWebsocket = appWebsocket
      this._appInfo = appInfo
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
      this._agentPubkey = encodeHashToBase64(todoCellId[1]);
    }
    catch (e) {
      console.log("error registering applet", e)
    }
  }

  async initializeSensemakerStore(clonedSensemakerRoleName: string) {
    this._appAgentWebsocket = await getAppAgentWebsocket(INSTALLED_APP_ID);;
    this._sensemakerStore = new SensemakerStore(this._appAgentWebsocket, clonedSensemakerRoleName);
  }

  async cloneSensemakerCell(ca_pubkey: string) {
    const clonedSensemakerCell: ClonedCell = await this._appWebsocket.createCloneCell({
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
    await this._adminWebsocket.authorizeSigningCredentials(clonedSensemakerCell.cell_id);
    await this.initializeSensemakerStore(clonedSensemakerCell.clone_id)
  }

  async createNeighbourhood(_e: CustomEvent) {
    await this.cloneSensemakerCell(this._agentPubkey)
    const _todoConfig = await this._sensemakerStore.registerApplet(appletConfig);
    console.log('App config :>> ', _todoConfig);
    this.loading = false;
  }

  async joinNeighbourhood(e: CustomEvent) {
    await this.cloneSensemakerCell(e.detail.newValue)
    // wait some time for the dht to sync, otherwise checkIfAppletConfigExists returns null
    setTimeout(async () => {
      console.log('attempt to install/join from agent 2:>> ');
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
      this._appAgentWebsocket,
      this._appInfo,
      {
        logoSrc: "",
        name: ""
      },
      this._sensemakerStore
    )
    return html`
      <main>
        <h3>My Pubkey: ${this._agentPubkey}</h3>
        <div
          @task-hash-created=${(e: CustomEvent) => { console.log('task created with hash:', e.detail.hash) }}
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
    :host {
      width: 100%;
      height: 100%;
    }

    app-renderer {
      width: 100%;
    }

    create-or-join-nh {
      width: 50vw;
      display: block;
      margin: 30vh auto;
      height: 50vh;
    }

    main {
      flex-grow: 1;
    }

    h3 {
      text-align: center;
    }

    mwc-circular-progress {
      position: fixed;
      top: 45vh;
      right: 48vw;
    }
  `;
}
