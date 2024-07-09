
import { property } from "lit/decorators.js";
import { ScopedRegistryHost } from "@lit-labs/scoped-registry-mixin";
import { LitElement, css, html, unsafeCSS } from "lit";
import { TaskItem } from "../task-item";
import { TodoStore } from "../../todo-store";
import { get } from "svelte/store";
import { List } from '@scoped-elements/material-web'
import { SensemakerStore } from "@neighbourhoods/client";
import { SensemakeResource } from "./sensemake-resource";
import { StoreSubscriber } from "lit-svelte-stores";
import { getHashesFromResourceDefNames } from "../../utils";
import { decodeHashFromBase64 } from "@holochain/client";

// add item at the bottom
export class ContextView extends ScopedRegistryHost(LitElement) {
    @property()
    public todoStore!: TodoStore

    @property()
    public sensemakerStore!: SensemakerStore

    @property()
    contextName!: string;

    tasksInContext = new StoreSubscriber(this, () => this.todoStore.tasksFromEntryHashes(get(this.sensemakerStore.contextResults())[this.contextName]));
    
    render() {
        // consider using `repeat()` instead of `map()`
        return html`
            ${this.tasksInContext.value.map((task) => html`
                    <task-item
                        .task=${task}
                        .completed=${('Complete' in task.entry.status)}
                        @task-toggle=${() => this.todoStore.toggleTaskStatus(task)}
                    ></task-item>
            `)}
        `
    }
    static get elementDefinitions() {
        return {
            'task-item': TaskItem,
            'mwc-list': List,
            'sensemake-resource': SensemakeResource,
        };
    }
    static get styles() {
        return [
            css`
                .sensemake-resource {
                    height: 60px;
                    display: flex;
                }
                task-item {
                    display: flex;
                    flex: 1;
                }
            `
        ]
    }
}
