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
        console.log("in the applet in we")
        console.log("registry", registry);
        console.log("applet app info", appletAppInfo)
        try {

          registry.define("todo-applet", TodoApplet);
          // element.innerHTML = `<script src="/node_modules/@webcomponents/scoped-custom-element-registry/scoped-custom-element-registry.min.js"></script>`
          element.innerHTML = `<todo-applet></todo-applet>`;
        }
        catch (e) {
          console.log('error in registry', e)
          throw e
        }
        // registry.upgrade("todo-applet", TodoApplet);
        const appletElement = element.querySelector("todo-applet") as any;
        appletElement.appWebsocket = appWebsocket;
        appletElement.appWebsocket = adminWebsocket;
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
