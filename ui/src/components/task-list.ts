import { contextProvided } from "@lit-labs/context";
import { property, state, query } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { Task } from "../types";
import { TaskItem } from "./task-item";
import { todoStoreContext } from "../contexts";
import { TodoStore } from "../todo-store";
import { get } from "svelte/store";
import { AddItem } from "./add-item";

// add item at the bottom
export class TaskList extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: todoStoreContext, subscribe: true })
    @property({attribute: false})
    public  todoStore!: TodoStore

    @property()
    listName: string | undefined

    @state()
    taskList = html``

    render() {
        this.updateTaskList()
        if (this.listName) {
            return html`
                <div class="task-list-container">
                    ${this.taskList}
                    <add-item itemType="task" @new-item=${this.addNewTask}></add-item>
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
            this.taskList = html`
            ${get(this.todoStore.listTasks(this.listName)).map((task) => html`
               <task-item .task=${task}></task-item> 
            `)}
            `
        }
    }
    static get scopedElements() {
        return {
        'task-item': TaskItem,
        'add-item': AddItem,
        };
    }
}
