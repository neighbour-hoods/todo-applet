import { contextProvided } from "@lit-labs/context";
import { property, state, query } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { Task } from "../types";
import { TaskItem } from "./task-item";
import { sensemakerStoreContext, todoStoreContext } from "../contexts";
import { TodoStore } from "../todo-store";
import { get } from "svelte/store";
import { AddItem } from "./add-item";
import { List } from '@scoped-elements/material-web'
import { Assessment, SensemakerStore } from "@lightningrodlabs/we-applet";


// add item at the bottom
export class TaskList extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: todoStoreContext, subscribe: true })
    @property({attribute: false})
    public  todoStore!: TodoStore

    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @property({attribute: false})
    public  sensemakerStore!: SensemakerStore

    @property()
    listName: string | undefined

    @state()
    tasks = html``

    render() {
        this.updateTaskList()
        if (this.listName) {
            return html`
                <div class="task-list-container">
                    <mwc-list>
                        ${this.tasks}
                        <add-item itemType="task" @new-item=${this.addNewTask}></add-item>
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
       await this.todoStore.addTaskToList({
        task_description: e.detail.newValue,
        list: this.listName!,
    })
        this.updateTaskList()
    }
    updateTaskList() {
        if (this.listName) {
            this.tasks = html`
            ${get(this.todoStore.listTasks(this.listName)).map((task) => html`
               <task-item .task=${task} .completed=${('Complete' in task.entry.status)} @toggle-task-status=${this.toggleTaskStatus}></task-item> 
            `)}
            `
            console.log('tasks in list', get(this.todoStore.listTasks(this.listName)))
        }
    }
    async toggleTaskStatus(e: CustomEvent) {
        await this.todoStore.toggleTaskStatus(this.listName!, e.detail.task)
        this.updateTaskList()
    }
    static get scopedElements() {
        return {
        'task-item': TaskItem,
        'add-item': AddItem,
        'mwc-list': List,
        };
    }
}
