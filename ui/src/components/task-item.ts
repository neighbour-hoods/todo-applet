import { property, state } from "lit/decorators.js";
import { html, css, CSSResult } from "lit";
import { Task, WrappedEntry } from "../types";
import { TodoStore } from "../todo-store";
import { NHCheckbox, NHComponent } from "@neighbourhoods/design-system-components";

export class TaskItem extends NHComponent {
    @property() todoStore!: TodoStore

    @state() task!: WrappedEntry<Task>

    render() {
        return html`
            <div class="task-item-container">
                <nh-checkbox
                    .size=${"auto"}
                    .label=${""}
                    name=${"task-item"}
                    class="check-list-item"
                    @click=${this.dispatchTaskToggle}
                >
                </nh-checkbox>

                <label for="task-item">${this.task.entry.description}</label>
            </div>
        `
    }

    dispatchTaskToggle() {
        this.dispatchEvent(new CustomEvent('task-toggle'))
    }

    async toggleTaskStatus() {
        await this.todoStore.toggleTaskStatus(this.task)
    }

    static elementDefinitions = {
        'nh-checkbox': NHCheckbox,
    }

    static styles: CSSResult[] = [
        super.styles as CSSResult,
        css`
            :host {
                display: flex;
                height: 2rem;
            }

            .task-item-container {
                display: flex;
                flex: 1;
                font-size: 16px;
                color: #fff;
                background-color: var(--nh-theme-bg-surface);
                border-radius: 8px;
                margin: 0;
                align-items: center;
                height: 100%;
                padding: 8px;
                box-sizing: border-box;
                justify-content: flex-start;
                display: flex;
            }
            .check-list-item, nh-checkbox {
                display: flex;
                flex: 1 1 0%;
                flex: initial;
            }
            nh-checkbox {
                width: 3rem;
                margin-right: 8px;
            }
        `
    ]
}
