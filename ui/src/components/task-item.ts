import { contextProvider, ContextProvider } from "@lit-labs/context";
import { property, state, query } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { Task } from "../types";

export class TaskItem extends ScopedElementsMixin(LitElement) {
    @property()
    @state()
    task!: Task
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
                    <input type="checkbox" ?checked=${('Complete' in this.task.status)}>
                </div>
                <div>
                    ${this.task.description}
                </div>
            </div>
        `
    }

}
