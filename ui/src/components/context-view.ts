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
import { repeat } from 'lit/directives/repeat.js';
import { encodeHashToBase64 } from "@holochain/client";


// add item at the bottom
export class ContextView extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: todoStoreContext, subscribe: true })
    @state()
    public todoStore!: TodoStore

    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @state()
    public sensemakerStore!: SensemakerStore

    @property()
    contextName!: string;

    render() {
        console.log('context result', get(this.sensemakerStore.contextResults()))
        const tasksInContext = addMyAssessmentsToTasks(this.todoStore.myAgentPubKey, get(this.todoStore.tasksFromEntryHashes(get(this.sensemakerStore.contextResults())["most_important_tasks"])), get(this.sensemakerStore.resourceAssessments()));
        return html`
            ${tasksInContext.map((task) => html`
                <task-item .task=${task} .completed=${('Complete' in task.entry.status)} .taskIsAssessed=${task.assessments != undefined}></task-item> 
            `)}
        `
    }
    static get scopedElements() {
        return {
            'task-item': TaskItem,
            'add-item': AddItem,
            'mwc-list': List,
        };
    }
}
