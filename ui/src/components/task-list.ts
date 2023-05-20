import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html } from "lit";
import { TaskItem } from "./task-item";
import { sensemakerStoreContext, todoStoreContext } from "../contexts";
import { TodoStore } from "../todo-store";
import { get } from "svelte/store";
import { AddItem } from "./add-item";
import { List } from '@scoped-elements/material-web'
import { Assessment, CreateAssessmentInput, RangeValueInteger, SensemakerStore, getLargestAssessment } from "@neighbourhoods/client";
import { addMyAssessmentsToTasks } from "../utils";
import { StoreSubscriber } from "lit-svelte-stores";
import {repeat} from 'lit/directives/repeat.js';
import { EntryHash, encodeHashToBase64 } from "@holochain/client";
import { ResourceWrapper } from "./sensemaker/resource-wrapper";
import { contextProvided } from "@lit-labs/context";
import { ImportanceDimensionAssessment } from "./sensemaker/widgets/importance-dimension-assessment";
import { HeatDimensionAssessment } from "./sensemaker/widgets/heat-dimension-assessment";
import { Task, WrappedEntry } from "../types";


// add item at the bottom
export class TaskList extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: todoStoreContext, subscribe: true })
    @state()
    public  todoStore!: TodoStore

    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @state()
    public  sensemakerStore!: SensemakerStore

    @property()
    listName: string | undefined

    @state()
    tasks = html``

    /**
     * component subscribers
     */
    listTasks = new StoreSubscriber(this, () => this.todoStore.listTasks(this.listName!));
    // not sure if I can use a reactive value in the subscriber callback
    // listTasksAssessments = new StoreSubscriber(this, () => this.sensemakerStore.resourceAssessments(this.listTasks.value.map((task) => encodeHashToBase64(task.entry_hash))));
    
    // TODO: figure out how to get a more relevent derived store, based on a the list of items, maybe I can use get instead of this.listTasks.value
    listTasksAssessments = new StoreSubscriber(this, () => this.sensemakerStore.resourceAssessments());
    appletUIConfig = new StoreSubscriber(this, () => this.sensemakerStore.appletUIConfig())

    render() {
        
        this.updateTaskList()

        if (this.listName) {
            return html`
                <div class="task-list-container">
                    <mwc-list>
                        ${this.tasks}
                    </mwc-list>
                </div>
            `
        }
        else {
            return html`
                <div>select a list!</div>
            `
        }
    }
    async addNewTask(e: CustomEvent) {
       await this.todoStore.addTaskToList({
        task_description: e.detail.newValue,
        list: this.listName!,
    })
    }
    // TODO: update this function name to be more descriptive/accurate
    updateTaskList() {
        if (this.listName) {
            const tasks = this.listTasks.value;
            this.tasks = html`
            ${tasks.length > 0 ? repeat(tasks, (task) => task.entry_hash, (task, index) => {
                return html`
                <resource-wrapper @create-assessment=${() => console.log('assessment creation event handle')}
                    .resourceEh=${task.entry_hash} 
                    .resourceDefEh=${get(this.sensemakerStore.appletConfig()).resource_defs["task_item"]}
                    .assessResourceWidget=${this.returnCurrentAssessmentWidget(get(this.sensemakerStore.appletConfig()).resource_defs["task_item"], task)}
                >
                    <task-item 
                        .task=${task} 
                        .completed=${('Complete' in task.entry.status)} 
                    ></task-item>
                </resource-wrapper> 
            `}) : html``}
            <add-item itemType="task" @new-item=${this.addNewTask}></add-item>
            `
        }
    }
    returnCurrentAssessmentWidget(resourceDefEh: EntryHash, task: WrappedEntry<Task>) {
        switch (this.appletUIConfig.value[encodeHashToBase64(resourceDefEh)].create_assessment_dimension) {
                        case get(this.sensemakerStore.appletConfig()).dimensions["importance"]: {
                            const importanceDimension = new ImportanceDimensionAssessment();
                            importanceDimension.resourceEh = task.entry_hash;
                            importanceDimension.resourceDefEh = get(this.sensemakerStore.appletConfig()).resource_defs["task_item"];
                            importanceDimension.dimensionEh = get(this.sensemakerStore.appletConfig()).dimensions["importance"];
                            importanceDimension.isAssessedByMe = false;
                            importanceDimension.addEventListener('create-assessment', (e) => console.log('assessment creation event handle', e));
                            return importanceDimension.render();
                        }
                        case get(this.sensemakerStore.appletConfig()).dimensions["perceived_heat"]: {
                            const heatDimension = new HeatDimensionAssessment();
                            heatDimension.resourceEh = task.entry_hash;
                            heatDimension.resourceDefEh = get(this.sensemakerStore.appletConfig()).resource_defs["task_item"];
                            heatDimension.dimensionEh = get(this.sensemakerStore.appletConfig()).dimensions["perceived_heat"];
                            heatDimension.isAssessedByMe = false;
                            heatDimension.addEventListener('create-assessment', (e) => console.log('assessment creation event handle', e));
                            return heatDimension.render();
                        }
                    }
    }
    static get scopedElements() {
        return {
        'task-item': TaskItem,
        'add-item': AddItem,
        'mwc-list': List,
        'resource-wrapper': ResourceWrapper,
        'importance-dimension-assessment': ImportanceDimensionAssessment,
        'heat-dimension-assessment': HeatDimensionAssessment,
        };
    }
}
