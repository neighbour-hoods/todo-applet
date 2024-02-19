import { property } from "lit/decorators.js";
import { html } from "lit";
import { TaskItem } from "./task-item";
import { TodoStore } from "../todo-store";
import { SensemakerStore } from "@neighbourhoods/client";
import { StoreSubscriber } from "lit-svelte-stores";
import {repeat} from 'lit/directives/repeat.js';
import { NHComponent } from "@neighbourhoods/design-system-components";

export class TaskList extends NHComponent {
    @property() todoStore!: TodoStore
    @property() sensemakerStore!: SensemakerStore
    @property() listName: string | undefined

    listTasks = new StoreSubscriber(this as any, () => this.todoStore.getTasks(this.listName!));

    render() {
        if (this.listName) {
            return html`
                <div class="task-list-container" style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
                    ${this.renderTaskList()}
                </div>
            `
        }
    }

    renderTaskList() {
        if (this.listName) {
            const tasks = this.listTasks.value;
            
            return html`
                ${tasks.length > 0 ? repeat(tasks, (task) => task.entry_hash, (task, _idx) => {
                    return html`
                        <task-item
                            .task=${task}
                            .todoStore=${this.todoStore}
                            .completed=${('Complete' in task.entry.status)}
                            @task-toggle=${() => this.todoStore.toggleTaskStatus(task)}
                        ></task-item>
                    `
                }) : null}
            `
        }
    }

    static elementDefinitions = {
        'task-item': TaskItem,
    };
}
