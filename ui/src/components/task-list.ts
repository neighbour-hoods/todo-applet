import { property, state } from "lit/decorators.js";
import { ScopedRegistryHost } from "@lit-labs/scoped-registry-mixin";
import { LitElement, css, html } from "lit";
import { TaskItem } from "./task-item";
import { TodoStore } from "../todo-store";
import { get } from "svelte/store";
import { List } from '@scoped-elements/material-web'
import { SensemakerStore } from "@neighbourhoods/client";
import { SensemakeResource } from "./sensemaker/sensemake-resource";
import { StoreSubscriber } from "lit-svelte-stores";
import {repeat} from 'lit/directives/repeat.js';
import { variables } from "../styles/variables";
import { getHashesFromResourceDefNames } from "../utils";
import { decodeHashFromBase64 } from "@holochain/client";

// add item at the bottom
export class TaskList extends ScopedRegistryHost(LitElement) {

    @property()
    public todoStore!: TodoStore

    @property()
    public sensemakerStore!: SensemakerStore

    @property()
    listName: string | undefined

    @state()
    tasks = html``

    /**
     * component subscribers
     */
    listTasks = new StoreSubscriber(this, () => this.todoStore.getTasks(this.listName!));
    // not sure if I can use a reactive value in the subscriber callback
    // listTasksAssessments = new StoreSubscriber(this, () => this.sensemakerStore.resourceAssessments(this.listTasks.value.map((task) => encodeHashToBase64(task.entry_hash))));

    render() {
        this.updateTaskList()

        if (this.listName) {
            return html`
                <div class="task-list-container">
                    <mwc-list>
                        ${this.tasks}
                    </mwc-list>
                </div>
            `
        }
        else {
            return html`
                <div>select a list!</div>
            `
        }
    }
    // TODO: update this function name to be more descriptive/accurate
    updateTaskList() {
        if (this.listName) {
            const tasks = this.listTasks.value;
            console.log('tasks subscribed', tasks)
            this.tasks = html`
            ${tasks.length > 0 ? repeat(tasks, (task) => task.entry_hash, (task, index) => {
                return html`
                <sensemake-resource
                    .resourceEh=${task.entry_hash}
                    .resourceDefEh=${decodeHashFromBase64(getHashesFromResourceDefNames(["task_item"], get(this.sensemakerStore.resourceDefinitions))[0])}
                >
                    <task-item
                        .task=${task}
                        .todoStore=${this.todoStore}
                        .completed=${('Complete' in task.entry.status)}
                        @task-toggle=${() => this.todoStore.toggleTaskStatus(task)}
                    ></task-item>
                </sensemake-resource>
            `}) : html``}
            `
        }
    }
    static get styles() {
        return [
        variables,
        css`
        mwc-list {
            position: relative;
        }
        add-item {
        }
        task-list-container {
            height: 100vh;
        }
    `]
    }
    static get elementDefinitions() {
        return {
        'task-item': TaskItem,
        'mwc-list': List,
        'sensemake-resource': SensemakeResource,
        };
    }
}
