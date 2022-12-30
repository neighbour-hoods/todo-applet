import { contextProvided } from "@lit-labs/context";
import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { AppletConfig } from "../types";
import { TaskItem } from "./task-item";
import { appletSensemakerConfigContext, sensemakerStoreContext, todoStoreContext } from "../contexts";
import { TodoStore } from "../todo-store";
import { get } from "svelte/store";
import { AddItem } from "./add-item";
import { List } from '@scoped-elements/material-web'
import { CreateAssessmentInput, SensemakerStore } from "@lightningrodlabs/we-applet";


// add item at the bottom
export class TaskList extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: todoStoreContext, subscribe: true })
    @property({attribute: false})
    public  todoStore!: TodoStore

    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @property({attribute: false})
    public  sensemakerStore!: SensemakerStore

    @contextProvided({ context: appletSensemakerConfigContext, subscribe: true })
    @property({attribute: false})
    public appletConfig!: AppletConfig

    @property()
    isContext!: boolean

    @property()
    listName: string | undefined

    @state()
    tasks = html``

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
        this.updateTaskList()
    }
    updateTaskList() {
        if (this.listName && !this.isContext) {
            this.tasks = html`
            ${this.todoStore.addMyAssessmentsToTasks(get(this.todoStore.listTasks(this.listName))).map((task) => html`
                <task-item .task=${task} .completed=${('Complete' in task.entry.status)} .taskIsAssessed=${task.assessments != undefined} @toggle-task-status=${this.toggleTaskStatus}  @assess-task-item=${this.assessTaskItem}></task-item> 
            `)}
            <add-item itemType="task" @new-item=${this.addNewTask}></add-item>
            `
            console.log('tasks in list, with assessment', this.todoStore.addMyAssessmentsToTasks(get(this.todoStore.listTasks(this.listName))))
        }
        else if (this.isContext) {
            const tasksInContext = this.appletConfig.contextResults["most_important_tasks"]
            this.tasks = html`
            ${tasksInContext.map((task) => html`
               <task-item .task=${task} .completed=${('Complete' in task.entry.status)} .taskIsAssessed=${task.assessments != undefined} @toggle-task-status=${this.toggleTaskStatus}></task-item> 
            `)}
            `
        }
    }
    async toggleTaskStatus(e: CustomEvent) {
        await this.todoStore.toggleTaskStatus(this.listName!, e.detail.task)
        this.updateTaskList()
    }
    async assessTaskItem(e: CustomEvent) {
        console.log(e.detail.task)
        const assessment: CreateAssessmentInput = {
            value: {
                Integer: 1
            },
            dimension_eh: this.appletConfig.dimensions["importance"],
            subject_eh: e.detail.task.entry_hash,
            maybe_input_dataSet: null,

        }
        const assessmentEh = await this.sensemakerStore.createAssessment(assessment)
        const objectiveAssessmentEh = await this.sensemakerStore.runMethod({
            resource_eh: e.detail.task.entry_hash,
            method_eh: this.appletConfig.methods["total_importance_method"],
        })
        console.log('created assessment', assessmentEh)
        console.log('created objective assessment', objectiveAssessmentEh)
        this.todoStore.addAssessment(assessment, e.detail.task.entry_hash)
    }
    static get scopedElements() {
        return {
        'task-item': TaskItem,
        'add-item': AddItem,
        'mwc-list': List,
        };
    }
}
