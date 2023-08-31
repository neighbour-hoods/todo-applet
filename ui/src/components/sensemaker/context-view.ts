import { contextProvided } from "@lit-labs/context";
import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, css, html, unsafeCSS } from "lit";
import { TaskItem } from "../task-item";
import { sensemakerStoreContext, todoStoreContext } from "../../contexts";
import { TodoStore } from "../../todo-store";
import { get } from "svelte/store";
import { AddItem } from "../add-item";
import { List } from '@scoped-elements/material-web'
import { SensemakerStore } from "@neighbourhoods/client";
import { SensemakeResource } from "./sensemake-resource";
import { StoreSubscriber } from "lit-svelte-stores";

// add item at the bottom
export class ContextView extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: todoStoreContext, subscribe: true })
    @state()
    public todoStore!: TodoStore

    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @state()
    public sensemakerStore!: SensemakerStore

    @property()
    contextName!: string;

    tasksInContext = new StoreSubscriber(this, () => this.todoStore.tasksFromEntryHashes(get(this.sensemakerStore.contextResults())[this.contextName]));
    render() {
        // consider using `repeat()` instead of `map()`
        return html`
            ${this.tasksInContext.value.map((task) => html`
                <sensemake-resource class="sensemake-resource"
                    .resourceEh=${task.entry_hash} 
                    .resourceDefEh=${get(this.sensemakerStore.flattenedAppletConfigs()).resource_defs["todo_lists"]["todo"]["task_item"]}
                >
                    <task-item 
                        .task=${task} 
                        .completed=${('Complete' in task.entry.status)} 
                        @task-toggle=${this.todoStore.toggleTaskStatus(task)}
                    ></task-item>
                </sensemake-resource>
            `)}
        `
    }
    static get scopedElements() {
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
