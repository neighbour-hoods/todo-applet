import { contextProvided } from "@lit-labs/context";
import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { Task, WrappedEntry, WrappedTaskWithAssessment } from "../types";
import { Checkbox, ListItem, CheckListItem } from '@scoped-elements/material-web'
import { sensemakerStoreContext, todoStoreContext } from "../contexts";
import { SensemakerStore } from "@neighbourhoods/client";
import { TodoStore } from "../todo-store";

export class TaskItem extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @property({ attribute: false })
    public sensemakerStore!: SensemakerStore

    @contextProvided({ context: todoStoreContext, subscribe: true })
    @state()
    public todoStore!: TodoStore
    
    @property()
    completed: boolean = false

    @property()
    @state()
    task!: WrappedEntry<Task>

    static styles = css`
          .task-item-container {
            display: flex;
            flex-direction: row;
          }
        `;

    render() {
        console.log(this.completed)
        return html`
            <div class="task-item-container">
                <mwc-check-list-item 
                    left 
                    ?selected=${this.completed} 
                    @click=${this.toggleTaskStatus}
                >
                    ${this.task.entry.description}
                </mwc-check-list-item>
            </div>
        `
    }
    async toggleTaskStatus() {
        await this.todoStore.toggleTaskStatus(this.task)
    }

    static get scopedElements() {
        return {
            'mwc-checkbox': Checkbox,
            'mwc-list-item': ListItem,
            'mwc-check-list-item': CheckListItem,
        }
    }
}
