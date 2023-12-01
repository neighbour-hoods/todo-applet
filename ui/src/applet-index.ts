import {
  NeighbourhoodApplet,
} from "@neighbourhoods/nh-launcher-applet";
import { TodoApplet } from "./applet/todo-applet";
import "./components/task-display-wrapper";
import { appletConfig } from "./appletConfig";
import { TaskDisplayWrapper } from "./components/task-display-wrapper";
import { HeatDimensionAssessment } from "./components/sensemaker/widgets/heat-dimension-assessment";
import { AverageHeatDimensionDisplay } from "./components/sensemaker/widgets/average-heat-dimension-display";

const todoApplet: NeighbourhoodApplet = {
  appletConfig: appletConfig,
  appletRenderers: {
    'full': TodoApplet
  },
  resourceRenderers: {
    'task_item': TaskDisplayWrapper
  },
  assessmentWidgets: { 
    'Importance Ranker': {
      name: 'Importance Ranker',
      range: { 
        Integer: {
          min: 0,
          max: 4
        }
      },
      component: HeatDimensionAssessment,
      kind: 'input'
    },
    'Average Importance': {
      name: 'Average Importance',
      range: { 
        Integer: {
          min: 0,
          max: 4
        }
      },
      component: AverageHeatDimensionDisplay,
      kind: 'output'
    }
  }
}

export default todoApplet;