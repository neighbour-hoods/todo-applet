// import { contextProvider, ContextProvider } from "@lit-labs/context";
import { property, state } from "lit/decorators.js";
import { AppWebsocket, AppEntryType, InstalledCell } from "@holochain/client";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { CircularProgress } from "@scoped-elements/material-web";
import { LitElement, html, css } from "lit";
import { InstalledAppletInfo, SensemakerStore, Dimension, CulturalContext, Threshold, ResourceType, SensemakerService } from "@neighbourhoods/nh-we-applet";
import { AppletConfig, TodoApp, TodoStore } from "@neighbourhoods/todo-applet"

export class TodoApplet extends ScopedElementsMixin(LitElement) {
  @property()
  todoStore!: TodoStore;

  @property()
  sensemakerStore!: SensemakerStore;

  @state()
  loaded = false;

  async firstUpdated() {
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
    const dimensionHash = await this.sensemakerStore.createDimension(dimension)
    console.log('dimension hash', dimensionHash)
    
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
    const objectiveDimensionHash = await this.sensemakerStore.createDimension(objectiveDimension)
    
    let app_entry_type: AppEntryType = { id: 0, zome_id: 0, visibility: { Public: null } };
    const resourceType: ResourceType = {
      name: "task-item",
      base_types: [app_entry_type],
      dimension_ehs: [dimensionHash]
    }

    const resourceTypeEh = await this.sensemakerStore.createResourceType(resourceType)

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

    const methodEh = await this.sensemakerStore.createMethod(totalImportanceMethod)
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

    const contextEh = await this.sensemakerStore.createCulturalContext(culturalContext)
    this.loaded = true;
  }
  static styles = css`
    .completed {
      text-decoration-line: line-through;
      color: #777;
    }
  `;

  render() {
    if (!this.loaded)
      return html`<div
        style="display: flex; flex: 1; flex-direction: row; align-items: center; justify-content: center"
      >
        <mwc-circular-progress></mwc-circular-progress>
      </div>`;

    return html`
      <todo-app .sensemakerStore=${this.sensemakerStore} .todoStore=${this.todoStore}></todo-app>
    `;
  }

  static get scopedElements() {
    return {
      "mwc-circular-progress": CircularProgress,
      "todo-app": TodoApp,
      // TODO: add any elements that you have in your applet
    };
  }

  // static styles = [
  //   css`
  //     :host {
  //       display: flex;
  //       flex: 1;
  //     }
  //   `,
  // ];
}

type ToDoItem = {
  text: string,
  completed: boolean
};

// @customElement('todo-list')
// export class ToDoList extends LitElement {

// }