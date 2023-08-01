import { contextProvided } from "@lit-labs/context";
import { customElement, property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css, PropertyValueMap } from "lit";
import { Task, WrappedEntry, WrappedTaskWithAssessment } from "../types";
import { Checkbox, ListItem, CheckListItem } from '@scoped-elements/material-web'
import { sensemakerStoreContext, todoStoreContext } from "../contexts";
import { SensemakerStore } from "@neighbourhoods/client";
import { TodoStore } from "../todo-store";
import { variables } from "../styles/variables";
import { ActionHash, AppAgentCallZomeRequest, AppAgentClient, EntryHash } from "@holochain/client";
import { TaskItem } from "./task-item";

@customElement("task-display-wrapper")
export class TaskDisplayWrapper extends ScopedElementsMixin(LitElement) {
    @property()
    resourceHash!: ActionHash;

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
            fn_name: "get_latest_task",
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

    static get scopedElements() {
        return {
            "task-item": TaskItem,
        }
    }
}

