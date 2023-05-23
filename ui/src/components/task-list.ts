import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html } from "lit";
import { TaskItem } from "./task-item";
import { sensemakerStoreContext, todoStoreContext } from "../contexts";
import { TodoStore } from "../todo-store";
import { get } from "svelte/store";
import { AddItem } from "./add-item";
import { List } from '@scoped-elements/material-web'
import { Assessment, CreateAssessmentInput, RangeValueInteger, SensemakerStore, getLargestAssessment, getLatestAssessment } from "@neighbourhoods/client";
import { addMyAssessmentsToTasks } from "../utils";
import { StoreSubscriber } from "lit-svelte-stores";
import {repeat} from 'lit/directives/repeat.js';
import { EntryHash, encodeHashToBase64 } from "@holochain/client";
import { ResourceWrapper } from "./sensemaker/resource-wrapper";
import { contextProvided } from "@lit-labs/context";
import { ImportanceDimensionAssessment } from "./sensemaker/widgets/importance-dimension-assessment";
import { HeatDimensionAssessment } from "./sensemaker/widgets/heat-dimension-assessment";
import { Task, WrappedEntry } from "../types";
import { AverageHeatDimensionDisplay } from "./sensemaker/widgets/heat-dimension-display";
import { ImportanceDimensionDisplay } from "./sensemaker/widgets/importance-dimension-display";


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
                <resource-wrapper
                    .resourceEh=${task.entry_hash} 
                    .resourceDefEh=${get(this.sensemakerStore.appletConfig()).resource_defs["task_item"]}
                    .assessDimensionWidget=${this.returnCurrentAssessmentWidget(get(this.sensemakerStore.appletConfig()).resource_defs["task_item"], task)}
                    .displayDimensionWidget=${this.returnCurrentDisplayWidget(get(this.sensemakerStore.appletConfig()).resource_defs["task_item"], task)}
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
                importanceDimension.addEventListener('create-assessment', (e) => this.createAssessment(e as CustomEvent));
                return importanceDimension.render();
            }
            case get(this.sensemakerStore.appletConfig()).dimensions["perceived_heat"]: {
                const heatDimension = new HeatDimensionAssessment();
                heatDimension.resourceEh = task.entry_hash;
                heatDimension.resourceDefEh = get(this.sensemakerStore.appletConfig()).resource_defs["task_item"];
                heatDimension.dimensionEh = get(this.sensemakerStore.appletConfig()).dimensions["perceived_heat"];
                heatDimension.isAssessedByMe = false;
                heatDimension.addEventListener('create-assessment', (e) => this.createAssessment(e as CustomEvent));
                return heatDimension.render();
            }
        }
    }
    returnCurrentDisplayWidget(resourceDefEh: EntryHash, task: WrappedEntry<Task>) {
        const resourceAssessments = this.listTasksAssessments?.value[encodeHashToBase64(task.entry_hash)]
        const appletConfig = get(this.sensemakerStore.appletConfig())
        const objectiveDimension = this.appletUIConfig.value[encodeHashToBase64(resourceDefEh)].display_objective_dimension;
        switch (objectiveDimension) {
            case appletConfig.dimensions["total_importance"]: {
                const latestAssessment = resourceAssessments ? getLatestAssessment(resourceAssessments, encodeHashToBase64(appletConfig.dimensions["total_importance"])) : null;
                const totalImportanceDimension = new ImportanceDimensionDisplay();
                totalImportanceDimension.assessment = latestAssessment;
                return totalImportanceDimension.render();
            }
            case get(this.sensemakerStore.appletConfig()).dimensions["average_heat"]: {
                const latestAssessment = resourceAssessments ? getLatestAssessment(resourceAssessments, encodeHashToBase64(appletConfig.dimensions["average_heat"])) : null;
                const averageHeatDimension = new AverageHeatDimensionDisplay();
                averageHeatDimension.assessment = latestAssessment;
                return averageHeatDimension.render();
            }
        }
    }
    async createAssessment(e: CustomEvent) {
        console.log('handle create assessment in resource wrapper')
        const assessment: CreateAssessmentInput = e.detail.assessment;
        const assessmentEh = await this.sensemakerStore.createAssessment(assessment)
        console.log('created assessment', assessmentEh)
        console.log('resource eh', get(this.sensemakerStore.appletUIConfig())[encodeHashToBase64(assessment.resource_def_eh)].method_for_created_assessment)
        try {

            const objectiveAssessment = await this.sensemakerStore.runMethod({
                resource_eh: assessment.resource_eh,
                method_eh: get(this.sensemakerStore.appletUIConfig())[encodeHashToBase64(assessment.resource_def_eh)].method_for_created_assessment,
            })
            console.log('method output', objectiveAssessment)
        }
        catch (e) {
            console.log('method error', e)
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
        'average-heat-dimension-display': AverageHeatDimensionDisplay,
        'importance-dimension-display': ImportanceDimensionDisplay,
        };
    }
}
