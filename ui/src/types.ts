import { ActionHash, EntryHash } from "@holochain/client"

interface Task {
    description: string,
    status: TaskStatus,
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

export {
    Task,
    TaskStatus,
    TaskStatusComplete,
    TaskStatusIncomplete,
    TaskToListInput,
    WrappedEntry
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
        [contextName: string]: Array<WrappedEntry<Task>>,
    }
}