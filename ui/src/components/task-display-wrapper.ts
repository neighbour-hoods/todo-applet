import { property, state } from "lit/decorators.js";
import { ScopedRegistryHost } from "@lit-labs/scoped-registry-mixin";
import { html } from "lit";
import { Task, WrappedEntry } from "../types";
import { AppAgentCallZomeRequest, AppAgentClient, EntryHash } from "@holochain/client";
import { TaskItem } from "./task-item";
import { RenderBlock } from "@neighbourhoods/client";

export class TaskDisplayWrapper extends ScopedRegistryHost(RenderBlock) {
    @property()
    resourceHash!: EntryHash;

    @property()
    appAgentWebsocket!: AppAgentClient;

    @state()
    fetchingResource = true;

    task?: WrappedEntry<Task>

    loadData = async () => {
        const req: AppAgentCallZomeRequest = {
            cap_secret: null,
            role_name: "todo_lists",
            zome_name: "todo",
            fn_name: "get_latest_task_with_eh",
            payload: this.resourceHash,
          }
        const task = await this.nhDelegate.appAgentWebsocket.callZome(req);
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

