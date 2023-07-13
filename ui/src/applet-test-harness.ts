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
import '@material/mwc-circular-progress';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TodoStore } from './todo-store';
import { CreateOrJoinNh } from './create-or-join-nh';
import { SensemakerStore } from '@neighbourhoods/client';
import { appletConfig } from './appletConfig'
import todoApplet from './applet/index'
import { AppletInfo, AppletRenderers } from '@neighbourhoods/nh-launcher-applet';
import { RenderBlock } from "./applet/render-block";
import { getCellId } from './utils';

@customElement('applet-test-harness')
export class AppletTestHarness extends ScopedElementsMixin(LitElement) {
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

  renderers!: AppletRenderers;
  appletInfo!: AppletInfo[];


  async firstUpdated() {
    // connect to holochain conductor and set up websocket connections
    try {
      await this.connectHolochain()
      const installedCells = this.appInfo.cell_info;
      await Promise.all(
        Object.keys(installedCells).map(roleName => {
          installedCells[roleName].map(cellInfo => {
            console.log('cell info map', cellInfo)
            this.adminWebsocket.authorizeSigningCredentials(getCellId(cellInfo)!);
          })
        })
      );

      // mocking what gets passed to the applet
      this.appletInfo = [{
        weInfo: {
            logoSrc: "",
            name: ""
        },
        appInfo: this.appInfo
      }];

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
    const appAgentWebsocket: AppAgentWebsocket = await AppAgentWebsocket.connect(`ws://localhost:9001`, "todo-sensemaker");
    this._sensemakerStore = new SensemakerStore(appAgentWebsocket, clonedSensemakerRoleName);
    // @ts-ignore
    this.renderers = await todoApplet.appletRenderers(this.appWebsocket, this.adminWebsocket, { sensemakerStore: this._sensemakerStore }, this.appletInfo);
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
    await this.adminWebsocket.authorizeSigningCredentials(clonedSensemakerCell.cell_id);
    await this.initializeSensemakerStore(clonedSensemakerCell.clone_id)
  }

  async createNeighbourhood(_e: CustomEvent) {
    await this.cloneSensemakerCell(this.agentPubkey)
    const _todoConfig = await this._sensemakerStore.registerApplet(appletConfig);
    
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
    return html`
      <main>
        <h3>My Pubkey: ${this.agentPubkey}</h3>
        <div class="home-page">
        <render-block
            .renderer=${this.renderers.full}
            style="flex: 1"
        ></render-block>
        </div>
      </main>
    `;
  }

  async connectHolochain() {
    this.adminWebsocket = await AdminWebsocket.connect(`ws://localhost:9000`);
    this.appWebsocket = await AppWebsocket.connect(`ws://localhost:9001`);
    this.appInfo = await this.appWebsocket.appInfo({
      installed_app_id: 'todo-sensemaker',
    });
    console.log("appInfo", this.appInfo)
  }

  static get scopedElements() {
    return {
      'create-or-join-nh': CreateOrJoinNh,
      'render-block': RenderBlock,
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

