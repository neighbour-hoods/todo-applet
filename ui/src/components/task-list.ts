import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, css, html } from "lit";
import { TaskItem } from "./task-item";
import { sensemakerStoreContext, todoStoreContext } from "../contexts";
import { TodoStore } from "../todo-store";
import { get } from "svelte/store";
import { AddItem } from "./add-item";
import { List } from '@scoped-elements/material-web'
import { SensemakerStore } from "@neighbourhoods/client";
import { SensemakeResource } from "./sensemaker/sensemake-resource";
import { StoreSubscriber } from "lit-svelte-stores";
import {repeat} from 'lit/directives/repeat.js';
import { contextProvided } from "@lit-labs/context";
import { variables } from "../styles/variables";

// add item at the bottom
export class TaskList extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: todoStoreContext, subscribe: true })
    @state()
    public  todoStore!: TodoStore

    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @state()
    public  sensemakerStore!: SensemakerStore

    @property()
    listName: string | undefined

    @state()
    tasks = html``

    /**
     * component subscribers
     */
    listTasks = new StoreSubscriber(this, () => this.todoStore.listTasks(this.listName!));
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
    async addNewTask(e: CustomEvent) {
        console.log('adding new item', e.detail.newValue)
       await this.todoStore.addTaskToList({
        task_description: e.detail.newValue,
        list: this.listName!,
    })
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
                    .resourceDefEh=${get(this.sensemakerStore.appletConfig()).resource_defs["task_item"]}
                >
                    <task-item 
                        .task=${task} 
                        .completed=${('Complete' in task.entry.status)} 
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
    static get scopedElements() {
        return {
        'task-item': TaskItem,
        'mwc-list': List,
        'sensemake-resource': SensemakeResource,
        };
    }
}
