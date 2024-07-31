import { TaskResourceView } from "task-resource-view";
import { property, state } from "lit/decorators.js";
import { repeat } from 'lit/directives/repeat.js';
import { Task } from "./types";

import {
  NHCheckbox,
  NHComponent,
} from "@neighbourhoods/design-system-components";
import { CSSResult, PropertyValueMap, css, html } from "lit";

import { FakeInputAssessmentControlDelegate, InputAssessmentRenderer, OutputAssessmentRenderer } from "@neighbourhoods/app-loader";
import { HeatDimensionAssessment, ImportanceDimensionAssessment } from "task-assessment-controls";

export class TaskListView extends NHComponent {
  @property()
  taskResourceView!: typeof TaskResourceView; // This should be an interface instead of a specified component type

  @property() listName: string | undefined;

  @state()
  listTasks!: Task[];

  render() {
    if (this.listName) {
      return html`
        <div
          class="task-list-container"
          style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;"
        >
          ${this.renderTaskList()}
        </div>
      `;
    }
  }

  firstUpdated(): void {
    if(!!this.taskResourceView && !customElements.get('task-resource-view')) {
      customElements.define('task-resource-view', this.taskResourceView);
      this.requestUpdate()
    }
  }

  renderTaskList() {
    if (this.listName && this.listTasks) {
      const tasks = this.listTasks;
      console.log('tasks :>> ', tasks);
      return html`
        ${tasks.length > 0
          ? repeat(
              tasks,
              (task, idx) => `${task.description}-${idx}`,
              (task, _idx) => {
                const d1 = new FakeInputAssessmentControlDelegate();
                const d2 = new FakeInputAssessmentControlDelegate();
console.log('task :>> ', task);
                return html`
                  <task-resource-view 
                    .task=${task}
                  >
                    <input-assessment-renderer
                      style="display:flex; justify-content: center; cursor: pointer;"
                      slot="vote"
                      .component=${ImportanceDimensionAssessment}
                      .nhDelegate=${d1}
                    ></input-assessment-renderer>

                    <input-assessment-renderer
                      style="display:flex; justify-content: center"
                      slot="input-assessment"
                      .component=${HeatDimensionAssessment}
                      .nhDelegate=${d2}
                    ></input-assessment-renderer>
                  </task-resource-view>
                `;
              }
            )
          : null}
      `;
    }
  }
  static elementDefinitions = {
    'task-resource-view': TaskResourceView,
    'input-assessment-renderer': InputAssessmentRenderer,
    'output-assessment-renderer': OutputAssessmentRenderer,
  };
}
