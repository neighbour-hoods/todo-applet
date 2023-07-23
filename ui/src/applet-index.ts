import {
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

const todoApplet: NhLauncherApplet = {
  // @ts-ignore
  async appletRenderers(
    weStore: WeServices,
    appletAppInfo: AppletInfo[],
    appWebsocket: AppWebsocket,
    appAgentWebsocket: AppAgentClient,
  ): Promise<AppletRenderers> {
    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        registry.define("todo-applet", TodoApplet);
        element.innerHTML = `<todo-applet></todo-applet>`;
        const appletElement = element.querySelector("todo-applet") as any;
        appletElement.appWebsocket = appWebsocket;
        appletElement.appAgentWebsocket = appAgentWebsocket;
        appletElement.appletAppInfo = appletAppInfo;
        appletElement.sensemakerStore = weStore.sensemakerStore;
      },
      blocks: [],
    };
  },
};

export default todoApplet;
