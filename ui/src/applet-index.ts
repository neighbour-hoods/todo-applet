import {
  ActionHash,
  AppAgentClient,
  AppWebsocket,
} from "@holochain/client";
import {
  NhLauncherApplet,
  AppletRenderers,
  WeServices,
  AppletInfo,
} from "@neighbourhoods/nh-launcher-applet";
import { TodoApplet } from "./applet/todo-applet";
import { html, render } from "lit";
import "./components/task-display-wrapper";

const todoApplet: NhLauncherApplet = {
  // @ts-ignore
  async appletRenderers(
    appAgentWebsocket: AppAgentClient,
    weStore: WeServices,
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
      blocks: [],
      //@ts-ignore
      resourceRenderers: {
        "task_item": (element: HTMLElement, resourceHash: ActionHash) => {
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
