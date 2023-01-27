import {
  AdminWebsocket,
  AppWebsocket,
} from "@holochain/client";
import {
  WeApplet,
  AppletRenderers,
  WeServices,
  AppletInfo,
} from "@neighbourhoods/nh-we-applet";
import { TodoApplet } from "./todo-applet";

const todoApplet: WeApplet = {
  async appletRenderers(
    appWebsocket: AppWebsocket,
    adminWebsocket: AdminWebsocket,
    weStore: WeServices,
    appletAppInfo: AppletInfo[]
  ): Promise<AppletRenderers> {
    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        registry.define("todo-applet", TodoApplet);
        element.innerHTML = `<todo-applet></todo-applet>`;
        const appletElement = element.querySelector("todo-applet") as any;
        appletElement.appWebsocket = appWebsocket;
        appletElement.appletAppInfo = appletAppInfo;
        appletElement.sensemakerStore = weStore.sensemakerStore;
      },
      blocks: [],
    };
  },
};

export default todoApplet;
