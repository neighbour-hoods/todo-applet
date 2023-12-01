import { Task, WrappedEntry, WrappedTaskWithAssessment } from "./types";
import { Assessment, CreateAssessmentInput, Dimension, ResourceDef, SensemakerStore } from "@neighbourhoods/client";
import { CellId, CellInfo, EntryHash, encodeHashToBase64 } from "@holochain/client";
import { CallbackFn, InputAssessmentWidgetDelegate, OutputAssessmentWidgetDelegate } from "@neighbourhoods/nh-launcher-applet";
import { get } from "svelte/store";

// this function is used to add assessments by the current agent to the tasks so that the 
// UI can display if the task has been assessed by the user
function addMyAssessmentsToTasks(myPubKey: string, tasks: WrappedEntry<Task>[], assessments: { [entryHash: string]: Array<Assessment> }): WrappedTaskWithAssessment[] {
    const tasksWithMyAssessments = tasks.map(task => {
      const assessmentsForTask = assessments[encodeHashToBase64(task.entry_hash)]
      let myAssessment
      if (assessmentsForTask) {
        myAssessment = assessmentsForTask.find(assessment => encodeHashToBase64(assessment.author) === myPubKey)
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
function getCellId(cellInfo: CellInfo): CellId | undefined {
  if ("provisioned" in cellInfo) {
    return cellInfo.provisioned.cell_id;
  }
  if ("cloned" in cellInfo) {
    return cellInfo.cloned.cell_id;
  }
  return undefined;
}
  
interface Named {
  name: string;
}

function getHashesFromNames<T extends Named>(names: string[], map: Map<string, T>): string[] {  
  let kvPairs = Array.from(map.entries());
  return kvPairs.filter((kvPair: [string, T]) => {
    return names.includes(kvPair[1].name);
  }).map((kvPair: [string, T]) => {
    return kvPair[0];
  });
}
function getHashesFromResourceDefNames(names: string[], map: Map<string, ResourceDef>): string[] {  
  let kvPairs = Array.from(map.entries());
  return kvPairs.filter((kvPair: [string, ResourceDef]) => {
    return names.includes(kvPair[1].resource_name);
  }).map((kvPair: [string, ResourceDef]) => {
    return kvPair[0];
  });
}
export { addMyAssessmentsToTasks, getCellId, getHashesFromNames, getHashesFromResourceDefNames }

export function inputWidgetDelegate(sensemakerStore: SensemakerStore): InputAssessmentWidgetDelegate {
  return {
    getLatestAssessmentForUser(resourceEh: EntryHash, dimensionEh: EntryHash) {
      return get(sensemakerStore.myLatestAssessmentAlongDimension(encodeHashToBase64(resourceEh), encodeHashToBase64(dimensionEh)));
    },
    subscribe(callback: CallbackFn, resourceEh: EntryHash, dimensionEh: EntryHash) {
      return sensemakerStore.myLatestAssessmentAlongDimension(encodeHashToBase64(resourceEh), encodeHashToBase64(dimensionEh)).subscribe(callback)
    },
    async createAssessment(assessment: CreateAssessmentInput) {
      let assessmentRecord = sensemakerStore.createAssessment(assessment);
      return assessmentRecord.then((assessmentRecord) => {
        // :TODO: update to latest neighbourhoods/client version 0.0.9 and then remove the ts-ignore
        //@ts-ignore
        let entryRecord = new EntryRecord<Assessment>(assessmentRecord);
        return entryRecord.entry;
      });
    }, 
    invalidateLastAssessment() {},
  }
}

/**
 * helper for output widget delegate construction
 */
export function outputWidgetDelegate(sensemakerStore: SensemakerStore): OutputAssessmentWidgetDelegate {
  return {
    getLatestAssessment(resourceEh: EntryHash, dimensionEh: EntryHash) {
      return get(sensemakerStore.myLatestAssessmentAlongDimension(encodeHashToBase64(resourceEh), encodeHashToBase64(dimensionEh)));
    },
    subscribe(callback: CallbackFn, resourceEh: EntryHash, dimensionEh: EntryHash) {
      return sensemakerStore.myLatestAssessmentAlongDimension(encodeHashToBase64(resourceEh), encodeHashToBase64(dimensionEh)).subscribe(callback)
    },
  }
}
