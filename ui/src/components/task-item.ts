import { contextProvider, ContextProvider } from "@lit-labs/context";
import { property, state, query } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { Task } from "../types";
import { ActionHash } from "@holochain/client";
import { Checkbox, ListItem } from '@scoped-elements/material-web'

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
        console.log(this.isComplete(this.task[1]))
        const checkBox = this.isComplete(this.task[1]) ? 
            html`
                <mwc-checkbox .checked=${true} @click=${this.dispatchToggleStatus}></mwc-checkbox>
            ` :
            html`
                <mwc-checkbox .checked=${false} @click=${this.dispatchToggleStatus}></mwc-checkbox>
            `;
        return html`
            <div class="task-item-container">
                ${checkBox}
                <mwc-list-item>${this.task[1].description}</mwc-list-item>
            </div>
        `
    }
    isComplete(task: Task) {
        return ('Complete' in task.status)
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

    static get scopedElements() {
        return {
            'mwc-checkbox': Checkbox,
            'mwc-list-item': ListItem,
        }
    }
}
