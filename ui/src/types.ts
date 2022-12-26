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

interface TasksInList {
    [actionHash: string]: Task,
}

export {
    Task,
    TaskStatus,
    TaskStatusComplete,
    TaskStatusIncomplete,
    TaskToListInput
}
