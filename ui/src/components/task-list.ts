import { contextProvided } from "@lit-labs/context";
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
import { encodeHashToBase64 } from "@holochain/client";


// add item at the bottom
export class TaskList extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: todoStoreContext, subscribe: true })
    @state()
    public  todoStore!: TodoStore

    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @state()
    public  sensemakerStore!: SensemakerStore

    @property()
    isContext!: boolean

    @property()
    listName: string | undefined

    @state()
    tasks = html``

    /**
     * component subscribers
     */
    listTasks = new StoreSubscriber(this, () => this.todoStore.listTasks(this.listName!));
    // not sure if I can use a reactive value in the subscriber callback
    // listTasksAssessments = new StoreSubscriber(this, () => this.sensemakerStore.resourceAssessments(this.listTasks?.value?.map((task) => encodeHashToBase64(task.entry_hash))));
    listTasksAssessments: StoreSubscriber<Record<string, Assessment[]>> | undefined

    firstUpdated() {
    this.listTasksAssessments = new StoreSubscriber(this, () => this.sensemakerStore.resourceAssessments(this.listTasks?.value?.map((task) => encodeHashToBase64(task.entry_hash))));

    }

    render() {
        this.updateTaskList()

        if (this.listName || this.isContext) {
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
        // check if displaying a context or not
        if (this.listName && !this.isContext) {
            const tasksWithAssessments = addMyAssessmentsToTasks(this.todoStore.myAgentPubKey, this.listTasks.value, this.listTasksAssessments ? this.listTasksAssessments.value : {});
            this.tasks = html`
            ${tasksWithAssessments.length > 0 ? repeat(tasksWithAssessments, (task) => task.entry_hash, (task, index) => {
                const taskTotalImportance = this.listTasksAssessments?.value[encodeHashToBase64(task.entry_hash)]
                // go through taskTotalImportance, filter to find the assessment with the dimension_eh that matches the importance dimension and return the highest value of matching assessments
                // add this as a helper to the sensemaker store
                const taskImportance = taskTotalImportance ? (getLargestAssessment(taskTotalImportance, encodeHashToBase64(get(this.sensemakerStore.appletConfig()).dimensions["total_importance"])).value as RangeValueInteger).Integer : 0

                return html`
                <task-item 
                    .task=${task} 
                    .completed=${('Complete' in task.entry.status)} 
                    .taskIsAssessed=${task.assessments != undefined} 
                    .totalImportance=${taskImportance}
                    @toggle-task-status=${this.toggleTaskStatus}  
                    @assess-task-item=${this.assessTaskItem}
                ></task-item> 
            `}) : html``}
            <add-item itemType="task" @new-item=${this.addNewTask}></add-item>
            `


            console.log('tasks in list, with assessment', tasksWithAssessments)
        }
        else if (this.isContext) {
            console.log('context result', get(this.sensemakerStore.contextResults()))
            const tasksInContext = addMyAssessmentsToTasks(this.todoStore.myAgentPubKey, get(this.todoStore.tasksFromEntryHashes(get(this.sensemakerStore.contextResults())["most_important_tasks"])), get(this.sensemakerStore.resourceAssessments()));
            this.tasks = html`
            ${tasksInContext.map((task) => html`
               <task-item .task=${task} .completed=${('Complete' in task.entry.status)} .taskIsAssessed=${task.assessments != undefined} @toggle-task-status=${this.toggleTaskStatus}></task-item> 
            `)}
            `
        }
    }
    async toggleTaskStatus(e: CustomEvent) {
        await this.todoStore.toggleTaskStatus(this.listName!, e.detail.task)
    }
    async assessTaskItem(e: CustomEvent) {
        console.log(e.detail.task)
        const assessment: CreateAssessmentInput = {
            value: {
                Integer: 1
            },
            // this is one of the main reasons we store the applet config in the sensemaker store, so that we can access
            // the entry hashes we need
            dimension_eh: get(this.sensemakerStore.appletConfig()).dimensions["importance"],
            resource_eh: e.detail.task.entry_hash,
            resource_def_eh: get(this.sensemakerStore.appletConfig()).resource_defs["task_item"],
            maybe_input_dataset: null,

        }
        console.log('assessment create input!', assessment)
        const assessmentEh = await this.sensemakerStore.createAssessment(assessment)
        const objectiveAssessmentEh = await this.sensemakerStore.runMethod({
            resource_eh: e.detail.task.entry_hash,
            method_eh: get(this.sensemakerStore.appletConfig()).methods["total_importance_method"],
        })
        console.log('created assessment', assessmentEh)
        console.log('created objective assessment', objectiveAssessmentEh)
    }
    static get scopedElements() {
        return {
        'task-item': TaskItem,
        'add-item': AddItem,
        'mwc-list': List,
        };
    }
}
