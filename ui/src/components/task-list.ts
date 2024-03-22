import { property } from "lit/decorators.js";
import { html } from "lit";
import { TaskItem } from "./task-item";
import { TodoStore } from "../todo-store";
import { AppletConfig, SensemakerStore } from "@neighbourhoods/client";
import { StoreSubscriber } from "lit-svelte-stores";
import { repeat } from 'lit/directives/repeat.js';
import { NHComponent } from "@neighbourhoods/design-system-components";
import { createInputAssessmentWidgetDelegate, createOutputAssessmentWidgetDelegate,  OutputAssessmentRenderer, InputAssessmentRenderer } from "@neighbourhoods/app-loader";
import { EntryHash } from "@holochain/client";
import applet from "../applet-index";

export class TaskList extends NHComponent {
    @property() todoStore!: TodoStore
    @property() sensemakerStore!: SensemakerStore
    @property() listName: string | undefined
    @property() config!: AppletConfig;

    listTasks = new StoreSubscriber(
        this as any,
        () => this?.todoStore?.getTasks(this.listName!),
        () => [this.listName, this.todoStore]
    );

    render() {
        if (this.listName) {
            return html`
                <div class="task-list-container" style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
                    ${this.renderTaskList()}
                </div>
            `
        }
    }

    createOutputAssessmentDelegate(resourceEh: EntryHash) {
        if(!this?.config) return
        const d = createOutputAssessmentWidgetDelegate(
            this.sensemakerStore,
            this.config.dimensions['Priority'],
            resourceEh
        )
        return d
    }

    createInputAssessmentDelegate(resourceEh: EntryHash) {
        if(!this?.config) return
        const d = createInputAssessmentWidgetDelegate(
            this.sensemakerStore,
            this.config.dimensions['Priority'],
            this.config.resource_defs['task_item'],
            resourceEh
        )
        return d
    }

    renderTaskList() {
        if (this.listName) {
            console.log('this.listTasks?.value :>> ', this.listTasks?.value);
            const tasks = this.listTasks?.value;
            if(!tasks) return;
            return html`
                ${tasks.length > 0 ? repeat(tasks, (task) => task.entry_hash, (task, _idx) => {
                    return html`
                        <task-item
                            .task=${task}
                            .todoStore=${this.todoStore}
                            .completed=${('Complete' in task.entry.status)}
                            @task-toggle=${() => this.todoStore.toggleTaskStatus(task)}
                        >
                            <output-assessment-renderer
                                slot="output-assessment"
                                .component=${applet.assessmentWidgets.heatOutput.component}
                                .nhDelegate=${this.createOutputAssessmentDelegate(task.entry_hash)}
                            ></output-assessment-renderer>

                            <input-assessment-renderer
                                slot="input-assessment"
                                .component=${applet.assessmentWidgets.heatAssessment.component}
                                .nhDelegate=${this.createInputAssessmentDelegate(task.entry_hash)}
                            ></input-assessment-renderer>
                        </task-item>
                    `
                }) : null}
            `
        }
    }

    static elementDefinitions = {
        'task-item': TaskItem,
        'input-assessment-renderer': InputAssessmentRenderer,
        'output-assessment-renderer': OutputAssessmentRenderer,
    };
}
