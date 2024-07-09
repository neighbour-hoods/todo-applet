import {
  AppAgentClient,
  EntryHash,
} from "@holochain/client";
import {
  NeighbourhoodApplet,
  AppletRenderers,
  NeighbourhoodServices,
  AppletInfo,
} from "@neighbourhoods/nh-launcher-applet";
import { TodoApplet } from "./applet/todo-applet";
import { html, render } from "lit";
import "./components/task-display-wrapper";
import { appletConfig } from "./appletConfig";
import { AverageHeatDimensionDisplay, HeatDimensionAssessment, ImportanceDimensionAssessment, TotalImportanceDimensionDisplay } from "./components/sensemaker/widgets";

const todoApplet: NeighbourhoodApplet = {
  appletConfig: appletConfig,
  widgetPairs: [
    {
      assess: ImportanceDimensionAssessment,
      display: TotalImportanceDimensionDisplay,
      compatibleDimensions: ["Vote", "Votes"],
    },
    {
      assess: HeatDimensionAssessment,
      display: AverageHeatDimensionDisplay,
      compatibleDimensions: ["Priority", "Priority level"],
    }
  ],
  async appletRenderers(
    appAgentWebsocket: AppAgentClient,
    weStore: NeighbourhoodServices,
    appletAppInfo: AppletInfo[],
  ): Promise<AppletRenderers> {
    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        registry.define("todo-applet", TodoApplet);
        element.innerHTML = `<todo-applet></todo-applet>`;
        const appletElement = element.querySelector("todo-applet") as any;
        appletElement.appAgentWebsocket = appAgentWebsocket;
        appletElement.appletAppInfo = appletAppInfo;
        appletElement.sensemakerStore = weStore.sensemakerStore;
      },
      resourceRenderers: {
        "task_item": (element: HTMLElement, resourceHash: EntryHash) => {
          console.log('trying to render task item', resourceHash) 
          render(html`
            <task-display-wrapper
              .resourceHash=${resourceHash}
              .appAgentWebsocket=${appAgentWebsocket}
            ></task-display-wrapper>
          `, element)
        }
      }
    };
  },
};

export default todoApplet;
