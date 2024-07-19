import { TaskResourceView } from 'task-resource-view';
import { contextProvided } from "@lit-labs/context";
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
                <slot name="vote"></slot>
                <div class="task-details">
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

                <slot name="input-assessment"></slot>
            </div>
        `
    }

    dispatchTaskToggle() {
        this.dispatchEvent(new CustomEvent('task-toggle'))
    }

    async toggleTaskStatus() {
        await this?.todoStore.toggleTaskStatus(this.task)
    }

    static get scopedElements() {
        return {
            'mwc-checkbox': Checkbox,
            'mwc-list-item': ListItem,
            'mwc-check-list-item': CheckListItem,
        }
    }
}
