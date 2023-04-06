import { contextProvided } from "@lit-labs/context";
import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { WrappedTaskWithAssessment } from "../types";
import { Checkbox, ListItem, CheckListItem } from '@scoped-elements/material-web'
import { sensemakerStoreContext } from "../contexts";
import { SensemakerStore } from "@neighbourhoods/client";

export class TaskItem extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @property({attribute: false})
    public  sensemakerStore!: SensemakerStore

    @property()
    completed: boolean = false

    @property()
    @state()
    task!: WrappedTaskWithAssessment

    @property()
    @state()
    taskIsAssessed = false

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
            <mwc-check-list-item left ?selected=${this.completed} @click=${this.dispatchToggleStatus}>${this.task.entry.description}</mwc-check-list-item>
            <mwc-checkbox ?disabled=${this.taskIsAssessed} ?checked=${this.taskIsAssessed} @click=${this.dispatchAssessTask}></mwc-checkbox>
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
    dispatchAssessTask() {
        console.log('clicked!', this.taskIsAssessed)
        if(!this.taskIsAssessed) {
            const task = this.task;
            if (task) {
                const options = {
                    detail: {
                        task,
                    },
                    bubbles: true,
                    composed: true
                };
                this.dispatchEvent(new CustomEvent('assess-task-item', options))
            }
            this.taskIsAssessed = !this.taskIsAssessed
        }
    }

    static get scopedElements() {
        return {
            'mwc-checkbox': Checkbox,
            'mwc-list-item': ListItem,
            'mwc-check-list-item': CheckListItem,
        }
    }
}
