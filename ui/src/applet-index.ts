import {
  NeighbourhoodApplet,
} from "@neighbourhoods/client";
import { TodoApplet } from "./todo-app";
import { TaskDisplayWrapper} from "./components/task-display-wrapper";
import { appletConfig } from "./appletConfig";
import {
  AverageHeatDimensionDisplay,
  HeatDimensionAssessment,
  ImportanceDimensionAssessment,
  TotalImportanceDimensionDisplay
} from "./components/sensemaker/widgets";

const applet: NeighbourhoodApplet = {
  appletConfig: appletConfig,
  appletRenderers: {
    full: TodoApplet
  },
  resourceRenderers: {
    "task_item": TaskDisplayWrapper
  },
  assessmentWidgets: {
    importanceAssessment: {
      name: "Importance Assessment",
      component: ImportanceDimensionAssessment,
      rangeKind: { Integer: {min: 0, max: 1}},
      kind: 'input'
    },
    importanceOutput: {
      name: "Importance Display",
      component: TotalImportanceDimensionDisplay,
      rangeKind: { Integer: { min: 0, max: 4294967295 }},
      kind: 'output'
    },
    heatAssessment: {
      name: "Heat Assessment",
      component: HeatDimensionAssessment,
      rangeKind: { Integer: { min: 0, max: 4 }},
      kind: 'input'
    },
    heatOutput: {
      name: "Heat Display",
      component: AverageHeatDimensionDisplay,
      rangeKind: { Integer: { min: 0, max: 4 }},
      kind: 'output'
    }
  }
};

export default applet;
