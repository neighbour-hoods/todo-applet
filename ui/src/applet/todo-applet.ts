import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { CircularProgress } from "@scoped-elements/material-web";
import { LitElement, html, css } from "lit";
import { AppletInfo } from "@neighbourhoods/nh-launcher-applet";
import { TodoApp, TodoStore, appletConfig, ImportanceDimensionAssessment, TotalImportanceDimensionDisplay, HeatDimensionAssessment, AverageHeatDimensionDisplay, getCellId } from "../index";
import { AppAgentClient, AppWebsocket, encodeHashToBase64 } from "@holochain/client";
import { SensemakerStore } from "@neighbourhoods/client";
import { get } from 'svelte/store';

export class TodoApplet extends ScopedElementsMixin(LitElement) {
  @property()
  appletAppInfo!: AppletInfo[];

  @property()
  appWebsocket!: AppWebsocket;

  @property()
  appAgentWebsocket!: AppAgentClient;

  @property()
  sensemakerStore!: SensemakerStore;

  @property()
  todoStore!: TodoStore;

  @state()
  loaded = false;

  async firstUpdated() {
    try {
      const appletRoleName = "todo_lists";
      const todoAppletInfo = this.appletAppInfo[0];
      const cellInfo = todoAppletInfo.appInfo.cell_info[appletRoleName][0]
      const cellId = getCellId(cellInfo);

      await this.sensemakerStore.registerApplet(appletConfig)

      await this.sensemakerStore.registerWidget(
        [
          encodeHashToBase64(get(this.sensemakerStore.appletConfig()).dimensions["importance"]),
          encodeHashToBase64(get(this.sensemakerStore.appletConfig()).dimensions["total_importance"]),
        ],
        TotalImportanceDimensionDisplay,
        ImportanceDimensionAssessment
      )
      await this.sensemakerStore.registerWidget(
        [
          encodeHashToBase64(get(this.sensemakerStore.appletConfig()).dimensions["perceived_heat"]),
          encodeHashToBase64(get(this.sensemakerStore.appletConfig()).dimensions["average_heat"]),
        ],
        AverageHeatDimensionDisplay,
        HeatDimensionAssessment
      )
      this.todoStore = new TodoStore(
        this.appAgentWebsocket,
        cellId!,
        appletRoleName
      );
      const allTasks = await this.todoStore.fetchAllTasks()
      const allTaskEntryHashes = get(this.todoStore.allTaskEntryHashes())
      const importanceDimensionEh = get(this.sensemakerStore.appletConfig()).dimensions["importance"]
      const totalImportanceDimensionEh = get(this.sensemakerStore.appletConfig()).dimensions["total_importance"]
      const perceivedHeatDimensionEh = get(this.sensemakerStore.appletConfig()).dimensions["perceived_heat"]
      const averageHeatDimensionEh = get(this.sensemakerStore.appletConfig()).dimensions["average_heat"]
      await this.sensemakerStore.getAssessmentsForResources({
      dimension_ehs: null,
      resource_ehs: allTaskEntryHashes
    })
      this.loaded = true;
    }
    catch (e) {
      console.log("error in first update", e)
    }
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
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`;
    return html`
      <todo-app style="height: 100vh; width: 100%; margin-bottom: 70px" .sensemakerStore=${this.sensemakerStore} .todoStore=${this.todoStore}></todo-app>
    `;
  }

  static get scopedElements() {
    return {
      "mwc-circular-progress": CircularProgress,
      "todo-app": TodoApp,
      'total-importance-dimension-display': TotalImportanceDimensionDisplay,
      'importance-dimension-assessment': ImportanceDimensionAssessment,
      'average-heat-dimension-display': AverageHeatDimensionDisplay,
      'heat-dimension-assessment': HeatDimensionAssessment,
      // TODO: add any elements that you have in your applet
    };
  }
}