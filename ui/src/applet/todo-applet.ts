import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { CircularProgress } from "@scoped-elements/material-web";
import { LitElement, html, css } from "lit";
import { AppBlockDelegate, AppletInfo, NHDelegateReceiver } from "@neighbourhoods/nh-launcher-applet";
import { TodoApp, TodoStore, appletConfig, ImportanceDimensionAssessment, TotalImportanceDimensionDisplay, getCellId } from "../index";
import { AppAgentClient, AppWebsocket } from "@holochain/client";
import { SensemakerStore } from "@neighbourhoods/client";
import { get } from 'svelte/store';

export class TodoApplet extends ScopedElementsMixin(LitElement) implements NHDelegateReceiver<AppBlockDelegate> {
  @property()
  appletAppInfo!: AppletInfo[];

  @property()
  appAgentWebsocket!: AppAgentClient;

  @property()
  sensemakerStore!: SensemakerStore;

  @property()
  todoStore!: TodoStore;

  @state()
  loaded = false;

  private _delegate: AppBlockDelegate | null = null

  constructor() {
    super();
    // start using the shadow DOM's shadowRoot
    this.attachShadow({mode: 'open'})
  }

  connectedCallback() {
    this._setupComponent()
  }

  set nhDelegate(delegate: AppBlockDelegate) {
    this._delegate = delegate;
    this._setupComponent()
  }

  async _setupComponent() {
    if (this._delegate) {
      const appAgentWebsocket = this._delegate.appAgentWebsocket;

      this.appAgentWebsocket = appAgentWebsocket;
      this.appletAppInfo = this._delegate.appletInfo;
      this.sensemakerStore = this._delegate.sensemakerStore;

    try {
      console.log("applet app info", this.appletAppInfo)
      const appletRoleName = "todo_lists";
      const todoAppletInfo = this.appletAppInfo[0];
      const cellInfo = todoAppletInfo.appInfo.cell_info[appletRoleName][0]
      const cellId = getCellId(cellInfo);
      const installAppId = todoAppletInfo.appInfo.installed_app_id;
      appletConfig.name = installAppId;

      this.todoStore = new TodoStore(
        this.appAgentWebsocket,
        cellId!,
        appletRoleName
      );
      const allTasks = await this.todoStore.fetchAllTasks()
      const allTaskEntryHashes = get(this.todoStore.allTaskEntryHashes())
      await this.sensemakerStore.getAssessmentsForResources({
        resource_ehs: allTaskEntryHashes
      })
      this.loaded = true;
    }
    catch (e) {
      console.log("error in first update", e)
    }
    }
  }

  async firstUpdated() {
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
      <todo-app style="height: 100vh; width: 100%; margin-bottom: 70px" .sensemakerStore=${this.sensemakerStore} .todoStore=${this.todoStore} .appletAppInfo=${this.appletAppInfo}></todo-app>
    `;
  }

  static get scopedElements() {
    return {
      "mwc-circular-progress": CircularProgress,
      "todo-app": TodoApp,
      'total-importance-dimension-display': TotalImportanceDimensionDisplay,
      'importance-dimension-assessment': ImportanceDimensionAssessment,
    };
  }
}

