import { property, state } from "lit/decorators.js";
import { Task, WrappedEntry } from "./types";
import { NHComponent } from "@neighbourhoods/design-system-components";
import { CheckListItem, Checkbox, ListItem } from "@scoped-elements/material-web";

export class TaskResourceView extends NHComponent {
  @property() @state()
  task!: WrappedEntry<Task>

  render() {
    return `
      <div class="task-item-container">
        <mwc-check-list-item class="check-list-item"
          left 
          ?selected=${Object.keys(this.task.entry.status)[0] == "Complete"} 
          @click=${this.dispatchTaskToggle}
        >
          ${this.task.entry.description}
        </mwc-check-list-item>
      </div>
    `
  }

  dispatchTaskToggle() {
    this.dispatchEvent(new CustomEvent('task-toggle'))
  }

  static elementDefinitions = {
    'mwc-checkbox': Checkbox,
    'mwc-list-item': ListItem,
    'mwc-check-list-item': CheckListItem,
  }
}

