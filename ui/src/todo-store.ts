import { CellClient, HolochainClient } from '@holochain-open-dev/cell-client';
import {
  AgentPubKeyB64,
  Dictionary,
} from '@holochain-open-dev/core-types';
import { serializeHash } from '@holochain-open-dev/utils';
import { derived, get, Writable, writable } from 'svelte/store';
import { EntryHash, InstalledCell } from '@holochain/client';
import { TodoService } from './todo-service';
import { Task, TaskToListInput, WrappedEntry, WrappedTaskWithAssessment } from './types';
import { Assessment, CreateAssessmentInput, SensemakerService } from '@lightningrodlabs/we-applet';

export class TodoStore {
  service: TodoService;
  sensemakerService: SensemakerService;
  dimensionEh: EntryHash;

  #tasksInLists: Writable<Dictionary<Array<WrappedEntry<Task>>>> = writable({});
  #taskAssessments: Writable<Dictionary<Array<Assessment>>> = writable({});

  #openedList: Writable<string> = writable("");

  get myAgentPubKey(): AgentPubKeyB64 {
    return serializeHash(this.todoCell.cell_id[1]);
  }

  constructor(
    protected client: HolochainClient,
    protected todoCell: InstalledCell,
    protected smService: SensemakerService,
    protected dimEh: EntryHash,
    zomeName: string = 'todo'
  ) {
    this.service = new TodoService(
      new CellClient(client, todoCell),
      zomeName
    );
    this.sensemakerService = smService;
    this.dimensionEh = dimEh;
  }

  listTasks(listName: string) {
    return derived(this.#tasksInLists, lists => lists[listName]);
  }

  listLists() {
    return derived(this.#tasksInLists, lists => Object.keys(lists));
  }

  allTaskEntyHashes() {
    return derived(this.#tasksInLists, lists => {
      let allTaskEhs: EntryHash[] = []
      const listNames = Object.keys(lists);
      for (const list of listNames) {
        const listEhs = lists[list].map(wrappedTask => wrappedTask.entry_hash)
        allTaskEhs = [
          ...allTaskEhs,
          ...listEhs
        ]
      }
      return allTaskEhs
    })
  }

  tasksFromEntryHashes(entryHashes: EntryHash[]) {
    const serializedEntryHashes = entryHashes.map(entryHash => serializeHash(entryHash));
    return derived(this.#tasksInLists, lists => {
      const tasks = Object.values(lists).flat();
      return tasks.filter(task => serializedEntryHashes.includes(serializeHash(task.entry_hash)))
    })
  }

  addMyAssessmentsToTasks(tasks: WrappedEntry<Task>[]): WrappedTaskWithAssessment[] {
    const myPubKey = this.myAgentPubKey;
    const tasksWithMyAssessments = tasks.map(task => {
      const assessmentsForTask = get(this.#taskAssessments)[serializeHash(task.entry_hash)]
      let myAssessment
      if (assessmentsForTask) {
        myAssessment = assessmentsForTask.find(assessment => serializeHash(assessment.author) === myPubKey)
      }
      else {
        myAssessment = undefined
      }
      return {
        ...task,
        assessments: myAssessment,
      }
    })
    return tasksWithMyAssessments
  }

  async fetchAllTasks() {
    const fetchedTasks = await this.service.getAllTasks();

    let assessmentsForTasks: Dictionary<Array<Assessment>> = {};
    // for each task, get all assessments, then convert into a dictionary keyed by the task entry hash
    const tasks = Object.values(fetchedTasks).flat()
    for (const task of tasks) {
          console.log('going to try and get assessments')
          const assessmentsOnTask = await this.sensemakerService.getAssessmentsForResource({
            resource_eh: task.entry_hash,
            dimension_eh: this.dimensionEh,
          })
          console.log('got it', assessmentsOnTask)
          assessmentsForTasks[serializeHash(task.entry_hash)] = assessmentsOnTask
    }
    this.#tasksInLists.update(tasks => ({
      ...tasks,
      ...fetchedTasks,
    }));
    this.#taskAssessments.update(assessments => ({
      ...assessments,
      ...assessmentsForTasks,
    }))

    return get(this.#tasksInLists)
  }

  async createNewList(list: string) {
    await this.service.createNewList(list);

    this.#tasksInLists.update(lists => {
      lists[list] = [];
      return lists;
    });
  }

  async addTaskToList(task: TaskToListInput) {
    let newTask = await this.service.addTaskToList(task);

    this.#tasksInLists.update(lists => {
      lists[task.list] = [...lists[task.list], newTask];
      return lists;
    });
  }

  async toggleTaskStatus(listName: string, wrappedTask: WrappedEntry<Task>) {
    let updatedTask = wrappedTask;
    if(('Complete' in wrappedTask.entry.status)) {
      await this.service.uncompleteTask(wrappedTask.action_hash);
      updatedTask.entry.status = { Incomplete: null };
    }
    else {
      await this.service.completeTask(wrappedTask.action_hash)
      updatedTask.entry.status = { Complete: null };
    }
    this.#tasksInLists.update(lists => {
      let updatedTaskInList = lists[listName].filter(({ action_hash: taskActionHash, entry: taskItem}) => serializeHash(taskActionHash) != serializeHash(wrappedTask.action_hash));
      updatedTaskInList.push(updatedTask);
      lists[listName] = updatedTaskInList;
      return lists;
    });
  }

  addAssessment(assessmentInput: CreateAssessmentInput, entryHash: EntryHash) {
    this.#taskAssessments.update(assessments => {
      const currAssessments = assessments[serializeHash(entryHash)] ? assessments[serializeHash(entryHash)] : [];
      assessments[serializeHash(entryHash)] = [...currAssessments, { ...assessmentInput, author: this.todoCell.cell_id[1] }]
      return assessments
    })
  }
}
