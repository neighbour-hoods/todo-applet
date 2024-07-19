import { customElement, property, state } from "lit/decorators.js";
import { LitElement, html } from "lit";
import { Task, WrappedEntry, WrappedTaskWithAssessment } from "./types";
import { AppAgentCallZomeRequest, AppAgentClient, EntryHash } from "@holochain/client";
// import { TaskItem } from "./task-item";
import { NHComponent } from "@neighbourhoods/design-system-components";

export class TaskResourceView extends NHComponent {
  @property()
  resource!: Task;

  @property()
  appAgentWebsocket!: AppAgentClient;

  @state()
  fetchingResource = true;

  task?: WrappedEntry<Task>

  protected async firstUpdated() {
      const req: AppAgentCallZomeRequest = {
          cap_secret: null,
          role_name: "todo_lists",
          zome_name: "todo",
          fn_name: "get_latest_task_with_eh",
          payload: this.resourceHash,
        }
      const task = await this.appAgentWebsocket.callZome(req);
      this.task = {
          entry: task,
          entry_hash: this.resourceHash,
          action_hash: this.resourceHash,
      }
      this.fetchingResource = false;
  }
  render() {
      if(this.fetchingResource) return html`<mwc-circular-progress></mwc-circular-progress>`
      else {
          return html`
              <task-item .task=${this.task}></task-item>
          `
      }
  }

  static elementDefinitions = {
    // "task-item": TaskItem,
  }
}

