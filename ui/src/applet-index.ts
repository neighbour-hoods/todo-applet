import {
  AdminWebsocket,
  AppWebsocket,
  CellType,
  ProvisionedCell,
} from "@holochain/client";
import {
  NhLauncherApplet,
  AppletRenderers,
  WeServices,
  AppletInfo,
} from "@neighbourhoods/nh-launcher-applet";
import { TodoApplet } from "./applet/todo-applet";

const todoApplet: NhLauncherApplet = {
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
        appletElement.adminWebsocket = adminWebsocket;
        appletElement.appletAppInfo = appletAppInfo;
        appletElement.sensemakerStore = weStore.sensemakerStore;
      },
      blocks: [],
    };
  },
};

export default todoApplet;
