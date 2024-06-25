import { property } from "lit/decorators.js";
import { html } from "lit";
import { TaskItem } from "./task-item";
import { TodoStore } from "../todo-store";
import { AppletConfig, Dimension, InputAssessmentControlDelegate, OutputAssessmentControlDelegate, SensemakerStore } from "@neighbourhoods/client";
import { StoreSubscriber } from "lit-svelte-stores";
import { repeat } from 'lit/directives/repeat.js';
import { NHComponent } from "@neighbourhoods/design-system-components";
import { createInputAssessmentControlDelegate, createOutputAssessmentControlDelegate,  OutputAssessmentRenderer, InputAssessmentRenderer } from "@neighbourhoods/app-loader";
import { EntryHash } from "@holochain/client";
import applet from "../applet-index";

export class TaskList extends NHComponent {
    @property() todoStore!: TodoStore
    @property() sensemakerStore!: SensemakerStore
    @property() listName: string | undefined
    @property() config!: AppletConfig;

    @property() existingDimensionEntries: Array<Dimension & { dimension_eh: EntryHash }> = [];

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

    createInputDelegate(dimensionName: string, resourceDefName: string, taskEh: EntryHash) : InputAssessmentControlDelegate | undefined {
        const assessableDimension = (this.config?.dimensions?.[dimensionName] || this.existingDimensionEntries?.find(dim => dim.name == dimensionName)?.dimension_eh);
        let delegate;
        try {
            if(!assessableDimension || !taskEh) {
                console.log('assessableDimension, taskEh, resourceDefName :>> ', assessableDimension, taskEh, resourceDefName);
                throw new Error("Not enough details to create delegate")
            }
            delegate = createInputAssessmentControlDelegate(
                this.sensemakerStore,
                assessableDimension,
                this.config.resource_defs[resourceDefName],
                taskEh
            )
        } catch (error) {
            console.error('Could not create working delegate :>> ', error);
        }
        return delegate
    }

    createOutputDelegate(dimensionName: string, taskEh: EntryHash) : OutputAssessmentControlDelegate | undefined {
        const assessableDimension = (this.config?.dimensions?.[dimensionName] || this.existingDimensionEntries?.find(dim => dim.name == dimensionName)?.dimension_eh);

        let delegate;
        try {
            if(!assessableDimension || !taskEh) {
                throw new Error("Not enough details to create delegate")
            }
            delegate = createOutputAssessmentControlDelegate(
                this.sensemakerStore,
                assessableDimension,
                taskEh
            )
        } catch (error) {
            console.error('Could not create working delegate :>> ', error);
        }
        return delegate
    }

    renderTaskList() {
        if (this.listName) {
            const tasks = this.listTasks?.value;
            if(!tasks) return;
            return html`
                ${tasks.length > 0 ? repeat(tasks, (task) => task.entry_hash, (task, _idx) => {
                    const d1 = this.createInputDelegate('Vote', 'task_item', task.entry_hash);
                    const d2 = this.createInputDelegate('Priority', 'task_item', task.entry_hash);

                    return html`
                        <task-item
                            .task=${task}
                            .todoStore=${this.todoStore}
                            .completed=${('Complete' in task.entry.status)}
                            @task-toggle=${() => this.todoStore.toggleTaskStatus(task)}
                        >
                            <input-assessment-renderer
                                style="display:flex; justify-content: center; cursor: pointer;"
                                slot="vote"
                                .component=${applet.assessmentControls.importanceAssessment.component}
                                .nhDelegate=${d1}
                            ></input-assessment-renderer>

                            <input-assessment-renderer
                                style="display:flex; justify-content: center"
                                slot="input-assessment"
                                .component=${applet.assessmentControls.heatAssessment.component}
                                .nhDelegate=${d2}
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
