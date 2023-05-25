import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html } from "lit";
import { TaskItem } from "./task-item";
import { sensemakerStoreContext, todoStoreContext } from "../contexts";
import { TodoStore } from "../todo-store";
import { get } from "svelte/store";
import { AddItem } from "./add-item";
import { List } from '@scoped-elements/material-web'
import { CreateAssessmentInput, SensemakerStore, WidgetRegistry, getLatestAssessment } from "@neighbourhoods/client";
import { StoreSubscriber } from "lit-svelte-stores";
import {repeat} from 'lit/directives/repeat.js';
import { encodeHashToBase64 } from "@holochain/client";
import { ResourceWrapper } from "./sensemaker/resource-wrapper";
import { contextProvided } from "@lit-labs/context";

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
        console.log('adding new item', e.detail.newValue)
       await this.todoStore.addTaskToList({
        task_description: e.detail.newValue,
        list: this.listName!,
    })
    }
    // TODO: update this function name to be more descriptive/accurate
    updateTaskList() {
        if (this.listName) {
            const tasks = this.listTasks.value;
            console.log('tasks subscribed', tasks)
            this.tasks = html`
            ${tasks.length > 0 ? repeat(tasks, (task) => task.entry_hash, (task, index) => {
                return html`
                <resource-wrapper 
                    .resourceEh=${task.entry_hash} 
                    .resourceDefEh=${get(this.sensemakerStore.appletConfig()).resource_defs["task_item"]}
                    .uid=${index}
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
    async createAssessment(e: CustomEvent) {
        console.log('handle create assessment in resource wrapper')
        const assessment: CreateAssessmentInput = e.detail.assessment;
        try {
            const assessmentEh = await this.sensemakerStore.createAssessment(assessment)
        }
        catch (e) {
            console.log('error creating assessment', e)
        }
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
        };
    }
}
