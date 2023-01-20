import { Task, WrappedEntry, WrappedTaskWithAssessment } from "./types";
import { Assessment } from "@neighbourhoods/sensemaker-lite-types";
import { encodeHashToBase64 } from "@holochain/client";
import { EntryHashMap } from "@holochain-open-dev/utils";

// this function is used to add assessments by the current agent to the tasks so that the 
// UI can display if the task has been assessed by the user
function addMyAssessmentsToTasks(myPubKey: string, tasks: WrappedEntry<Task>[], assessments: EntryHashMap<Array<Assessment>>): WrappedTaskWithAssessment[] {
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

  export { addMyAssessmentsToTasks }