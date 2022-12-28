import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  AppWebsocket,
  ActionHash,
  InstalledAppInfo,
  AdminWebsocket,
  InstalledCell,
  AppEntryType,
  EntryHash,
} from '@holochain/client';
import { contextProvider } from '@lit-labs/context';
import '@material/mwc-circular-progress';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { HolochainClient, CellClient } from '@holochain-open-dev/cell-client';

import { appWebsocketContext, appInfoContext, adminWebsocketContext, todoStoreContext, sensemakerStoreContext } from './contexts';
import { TodoStore } from './todo-store';
import { Assessment, ComputeContextInput, CulturalContext, Dimension, ResourceType, SensemakerService, SensemakerStore, Threshold } from '@lightningrodlabs/we-applet';
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

  @property()
  sensemakerDimensionHash: EntryHash | undefined

  @property()
  methodEh: EntryHash | undefined

  @property()
  contextEh: EntryHash | undefined

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
      <task-list listName=${this.activeList} @assess-task-item=${this.assessTaskItem}></task-list>
    ` 

    return html`
      <main>
        <div class="home-page">
          <list-list @list-selected=${this.updateActiveList} @context-selected=${this.computeContext}></list-list>
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
      "name": "1-scale",
      "kind": {
        "Integer": { "min": 0, "max": 1 }
      },
    };

    const dimension: Dimension = {
      name: "importance",
      range: integerRange
    }
    const dimensionHash = await this._sensemakerStore.createDimension(dimension)
    console.log('dimension hash', dimensionHash)
    this.sensemakerDimensionHash = dimensionHash
    
    const integerRange2 = {
      name: "1-scale-total",
      kind: {
        Integer: { min: 0, max: 1000000 },
      },
    };

    const objectiveDimension = {
      name: "total_importance",
      range: integerRange2,
    };
    const objectiveDimensionHash = await this._sensemakerStore.createDimension(objectiveDimension)
    
    let app_entry_type: AppEntryType = { id: 0, zome_id: 0, visibility: { Public: null } };
    const resourceType: ResourceType = {
      name: "task-item",
      base_types: [app_entry_type],
      dimension_ehs: [dimensionHash]
    }

    const resourceTypeEh = await this._sensemakerStore.createResourceType(resourceType)

    const totalImportanceMethod = {
      name: "total_importance_method",
      target_resource_type_eh: resourceTypeEh,
      input_dimension_ehs: [dimensionHash],
      output_dimension_eh: objectiveDimensionHash,
      program: { Sum: null },
      can_compute_live: false,
      must_publish_dataset: false,
    };

    const methodEh = await this._sensemakerStore.createMethod(totalImportanceMethod)
    this.methodEh = methodEh
    const threshold: Threshold = {
      dimension_eh: objectiveDimensionHash,
      kind: { GreaterThan: null },
      value: { Integer: 0 },
    };

    const culturalContext: CulturalContext = {
      name: "most important tasks",
      resource_type_eh: resourceTypeEh,
      thresholds: [threshold],
      order_by: [[objectiveDimensionHash, { Biggest: null }]], // DimensionEh
    };

    const contextEh = await this._sensemakerStore.createCulturalContext(culturalContext)
    this.contextEh = contextEh
  }
  updateActiveList(e: CustomEvent) {
    this.activeList = e.detail.selectedList;
  }
  async assessTaskItem(e: CustomEvent) {
      console.log(e.detail.task)
      const assessment: Assessment = {
          value: {
              Integer: 1
          },
          dimension_eh: this.sensemakerDimensionHash!,
          subject_eh: e.detail.task.entry_hash,
          maybe_input_dataSet: null,

      }
      const assessmentEh = await this._sensemakerStore.createAssessment(assessment)
      const objectiveAssessmentEh = await this._sensemakerStore.runMethod({
        resource_eh: e.detail.task.entry_hash,
        method_eh: this.methodEh!,
      })
      console.log('created assessment', assessmentEh)
      console.log('created objective assessment', objectiveAssessmentEh)
  }

  async computeContext(_e: CustomEvent) {
    const contextResultInput: ComputeContextInput = {
      resource_ehs: get(this._todoStore.allTaskEntyHashes()),
      context_eh: this.contextEh!,
      can_publish_result: false,
    }
    const contextResult = await this._sensemakerStore.computeContext(contextResultInput)
    console.log('context result', contextResult)
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
