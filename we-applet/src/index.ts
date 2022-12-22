import {
  AdminWebsocket,
  AppWebsocket,
  InstalledAppInfo,
  InstalledCell,
} from "@holochain/client";
import {
  WeApplet,
  AppletRenderers,
  WeServices,
  InstalledAppletInfo,
  Dimension
} from "@lightningrodlabs/we-applet";

import { TodoApplet } from "./todo-applet";

const todoApplet: WeApplet = {
  async appletRenderers(
    appWebsocket: AppWebsocket,
    adminWebsocket: AdminWebsocket,
    weStore: WeServices,
    appletAppInfo: InstalledAppletInfo[]
  ): Promise<AppletRenderers> {
    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        registry.define("todo-applet", TodoApplet);
        element.innerHTML = `<todo-applet></todo-applet>`;
        const appletElement = element.querySelector("todo-applet") as any;

        appletElement.appWebsocket =  appWebsocket;
        appletElement.profilesStore = weStore.profilesStore;
        appletElement.appletAppInfo = appletAppInfo;
        appletElement.sensemakerStore = weStore.sensemakerStore;
        console.log('sensemaker store in index', weStore.sensemakerStore)
        console.log('profile store in index', weStore.profilesStore)
      },
      blocks: [],
    };
  },
};

export default todoApplet;
