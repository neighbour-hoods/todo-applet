import { contextProvided } from "@lit-labs/context";
import { property, state, query } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { Task } from "../types";
import { TaskItem } from "./task-item";
import { todoStoreContext } from "../contexts";
import { TodoStore } from "../todo-store";
import { get } from "svelte/store";

// add item at the bottom
export class TaskList extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: todoStoreContext, subscribe: true })
    @property({attribute: false})
    public  todoStore!: TodoStore

    @property()
    listName!: string

    render() {
        const taskList = html`
        ${get(this.todoStore.listTasks(this.listName)).map((task) => html`
           <task-item .task=${task}></task-item> 
        `)}
        `
        return html`
            ${taskList}
        `
    }
    static get scopedElements() {
        return {
        'task-item': TaskItem,
        };
    }
}
