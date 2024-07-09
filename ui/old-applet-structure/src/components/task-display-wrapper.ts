import { state } from "lit/decorators.js";
import { ScopedRegistryHost } from "@lit-labs/scoped-registry-mixin";
import { html } from "lit";
import { Task, WrappedEntry } from "../types";
import { AppAgentCallZomeRequest } from "@holochain/client";
import { TaskItem } from "./task-item";
import { RenderBlock } from "@neighbourhoods/client";
import { CircularProgress } from "@scoped-elements/material-web";

export class TaskDisplayWrapper extends ScopedRegistryHost(RenderBlock) {
    @state() fetchingResource = true;

    task?: WrappedEntry<Task>

    async loadData() {
        await super.loadData();
        
        if(!this.resourceHash) throw new Error('Could not fetch resource in resource renderer');

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
        if(this.fetchingResource) return html`<mwc-circular-progress style="margin-top: 16px;" indeterminate></mwc-circular-progress>`
        else {
            return html`
                <task-item .task=${this.task}></task-item>
            `
        }
    }

    static elementDefinitions = {
        "task-item": TaskItem,
        'mwc-circular-progress': CircularProgress,
    }
}

