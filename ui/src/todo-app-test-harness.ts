import { LitElement, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  AppWebsocket,
  ActionHash,
  InstalledAppInfo,
  AdminWebsocket,
  InstalledCell,
  AppEntryType,
} from '@holochain/client';
import '@material/mwc-circular-progress';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { HolochainClient, CellClient } from '@holochain-open-dev/cell-client';

import { TodoStore } from './todo-store';
import { CulturalContext, Dimension, ResourceType, SensemakerService, SensemakerStore, Threshold } from '@lightningrodlabs/we-applet';
import { serializeHash } from '@holochain-open-dev/utils';
import { AppletConfig, TodoApp } from './index'

export class TodoAppTestHarness extends ScopedElementsMixin(LitElement) {
  @state() loading = true;
  @state() actionHash: ActionHash | undefined;
  @state() currentSelectedList: string | undefined;

  @property({ type: Object })
  appWebsocket!: AppWebsocket;

  @property({ type: Object })
  adminWebsocket!: AdminWebsocket;

  @property({ type: Object })
  appInfo!: InstalledAppInfo;

  @property()
  _todoStore!: TodoStore;

  @property()
  _sensemakerStore!: SensemakerStore;

  @property()
  _appletConfig: AppletConfig = { dimensions: {}, methods: {}, contexts: {}, contextResults: {}};


  async firstUpdated() {
    await this.connectHolochain()

    const installedCells = this.appInfo.cell_data;
    const sensemakerService = await this.initializeSensemaker(installedCells)

    const todoCell = installedCells.find(
      c => c.role_id === 'todo_lists'
    ) as InstalledCell;
    console.log("todo cell", todoCell)

    this._todoStore = new TodoStore(
        new HolochainClient(this.appWebsocket),
        todoCell,
        sensemakerService,
        this._appletConfig.dimensions["importance"],
    );
    const allTasks = await this._todoStore.fetchAllTasks()
    console.log(allTasks)
    this.loading = false;
  }

  render() {
    if (this.loading)
      return html`
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      `;
    return html`
      <main>
        <div class="home-page">
          <todo-app .sensemakerStore=${this._sensemakerStore} .todoStore=${this._todoStore} .appletConfig=${this._appletConfig}></todo-app>
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

  async initializeSensemaker(installedCells: InstalledCell[]): Promise<SensemakerService> {
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
    const sensemakerService = new SensemakerService(sensemakerCellClient)
    this._sensemakerStore = new SensemakerStore(sensemakerService);


    const integerRange = {
      "name": "1-scale",
      "kind": {
        "Integer": { "min": 0, "max": 1 }
      },
    };

    const dimensionName = "importance"
    const dimension: Dimension = {
      name: dimensionName,
      range: integerRange,
      computed: false,
    }
    const dimensionHash = await this._sensemakerStore.createDimension(dimension)
    console.log('dimension hash', dimensionHash)
    this._appletConfig.dimensions[dimensionName] = dimensionHash
    
    const integerRange2 = {
      name: "1-scale-total",
      kind: {
        Integer: { min: 0, max: 1000000 },
      },
    };

    const objectiveDimension = {
      name: "total_importance",
      range: integerRange2,
      computed: true,
    };
    const objectiveDimensionHash = await this._sensemakerStore.createDimension(objectiveDimension)
    
    let app_entry_type: AppEntryType = { id: 0, zome_id: 0, visibility: { Public: null } };
    const resourceType: ResourceType = {
      name: "task-item",
      base_types: [app_entry_type],
      dimension_ehs: [dimensionHash]
    }

    const resourceTypeEh = await this._sensemakerStore.createResourceType(resourceType)

    const methodName = "total_importance_method"
    const totalImportanceMethod = {
      name: methodName,
      target_resource_type_eh: resourceTypeEh,
      input_dimension_ehs: [dimensionHash],
      output_dimension_eh: objectiveDimensionHash,
      program: { Sum: null },
      can_compute_live: false,
      must_publish_dataset: false,
    };

    const methodEh = await this._sensemakerStore.createMethod(totalImportanceMethod)
    this._appletConfig.methods[methodName] = methodEh;
    const threshold: Threshold = {
      dimension_eh: objectiveDimensionHash,
      kind: { GreaterThan: null },
      value: { Integer: 0 },
    };

    const culturalContext: CulturalContext = {
      name: "most_important_tasks",
      resource_type_eh: resourceTypeEh,
      thresholds: [threshold],
      order_by: [[objectiveDimensionHash, { Biggest: null }]], // DimensionEh
    };

    const contextEh = await this._sensemakerStore.createCulturalContext(culturalContext)
    this._appletConfig.contexts["most_important_tasks"] = contextEh;

    return sensemakerService
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
