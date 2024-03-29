import { Task, WrappedEntry, WrappedTaskWithAssessment } from "./types";
import { Assessment } from "@neighbourhoods/client";
import { CellId, CellInfo, encodeHashToBase64 } from "@holochain/client";

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
  
export { addMyAssessmentsToTasks, getCellId }
