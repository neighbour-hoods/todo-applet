import { property, state } from "lit/decorators.js";
import { ScopedRegistryHost } from "@lit-labs/scoped-registry-mixin";
import { LitElement, html, css } from "lit";
import { Task, WrappedEntry } from "../types";
import { Checkbox, ListItem, CheckListItem } from '@scoped-elements/material-web'
import { TodoStore } from "../todo-store";
import { variables } from "../styles/variables";

export class TaskItem extends ScopedRegistryHost(LitElement) {
    @property()
    public todoStore!: TodoStore

    @property()
    completed: boolean = false

    @property()
    @state()
    task!: WrappedEntry<Task>

    static get styles() {
        return [
            variables,
            css`
              .task-item-container {
                display: flex;
                flex-direction: row;
                color: var(--nh-theme-fg-default);
                flex: 1;
                background-color: var(--nh-theme-bg-surface);
                border-radius: var(--border-r-tiny);
                margin: 4px;
                font-size: 16px;
              }
              .check-list-item {
                color: var(--nh-theme-fg-default);
                width: 100%;
              }`
        ]
    }

    render() {
        // console.log(this.completed)
        return html`
            <div class="task-item-container">
                <input type="checkbox" class="check-list-item"
                    checked=${this.completed}
                    @click=${this.dispatchTaskToggle}
                >
                </input>

                <label>${this.task.entry.description}</label>
            </div>
        `
    }
    dispatchTaskToggle() {
        this.dispatchEvent(new CustomEvent('task-toggle'))
    }

    async toggleTaskStatus() {
        await this.todoStore.toggleTaskStatus(this.task)
    }

    static get elementDefinitions() {
        return {
            'mwc-checkbox': Checkbox,
            'mwc-list-item': ListItem,
            // 'nh-checkbox': NHCheckbox,
        }
    }
}
