import { ActionHash, EntryHash } from "@holochain/client"
import { Assessment } from "@neighbourhoods/client"

interface Task {
    description: string,
    status: TaskStatus,
    list: string,
}


type TaskStatus = TaskStatusComplete | TaskStatusIncomplete

interface TaskStatusComplete {
    Complete: null,
}

interface TaskStatusIncomplete {
    Incomplete: null,
}

interface TaskToListInput {
    task_description: string,
    list: string,
}

interface WrappedEntry<T> {
    action_hash: ActionHash,
    entry_hash: EntryHash,
    entry: T,
}
// defining a new type for including an assessment with the task
type WrappedTaskWithAssessment = WrappedEntry<Task> & {
    assessments: Assessment | undefined,
}

export type SignalPayload = 
| {
    type: "NewTask",
    task: WrappedEntry<Task>,
} | {
    type: "NewList",
    list: string,
}

export {
    Task,
    TaskStatus,
    TaskStatusComplete,
    TaskStatusIncomplete,
    TaskToListInput,
    WrappedEntry,
    WrappedTaskWithAssessment,
}

export interface AppletConfig {
    dimensions: {
        [dimensionName: string]: EntryHash,
    },
    methods: {
        [methodName: string]: EntryHash,
    },
    contexts: {
        [contextName: string]: EntryHash,
    },
    contextResults: {
        [contextName: string]: Array<WrappedTaskWithAssessment>,
    }
}