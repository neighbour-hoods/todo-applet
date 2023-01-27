import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { CircularProgress } from "@scoped-elements/material-web";
import { LitElement, html, css } from "lit";
import { AppletInfo, SensemakerStore } from "@neighbourhoods/nh-we-applet";
import { TodoApp, TodoStore } from "@neighbourhoods/todo-applet";
import appletConfig from './appletConfig';
import { AppWebsocket, Cell } from "@holochain/client";

export class TodoApplet extends ScopedElementsMixin(LitElement) {
  @property()
  appletAppInfo!: AppletInfo[];

  @property()
  appWebsocket!: AppWebsocket;

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
      const todoCellInfo = (cellInfo as { "Provisioned": Cell }).Provisioned;

      const maybeAppletConfig = await this.sensemakerStore.checkIfAppletConfigExists(appletConfig.name)
      if (!maybeAppletConfig) {
        await this.sensemakerStore.registerApplet(appletConfig)
      }

      const appWs = await AppWebsocket.connect(this.appWebsocket.client.socket.url)
      this.todoStore = new TodoStore(
        appWs,
        todoCellInfo.cell_id,
        appletRoleName
      );
      const allTasks = await this.todoStore.fetchAllTasks()
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
}