import { contextProvider, ContextProvider } from "@lit-labs/context";
import { property, state, query } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { Task } from "../types";
import { ActionHash } from "@holochain/client";

export class TaskItem extends ScopedElementsMixin(LitElement) {
    @property()
    @state()
    task!: [ActionHash, Task]
    static styles = css`
          .task-item-container {
            display: flex;
            flex-direction: row;
          }
        `;

    render() {
        return html`
            <div class="task-item-container">
                <div>
                    <input type="checkbox" ?checked=${('Complete' in this.task[1].status)} @click=${this.dispatchToggleStatus}>
                </div>
                <div>
                    ${this.task[1].description}
                </div>
            </div>
        `
    }

    dispatchToggleStatus() {
        const task = this.task;
        if (task) {
            const options = {
                detail: {
                    task,
                },
                bubbles: true,
                composed: true
            };
            this.dispatchEvent(new CustomEvent('toggle-task-status', options))
        }
    }
}
