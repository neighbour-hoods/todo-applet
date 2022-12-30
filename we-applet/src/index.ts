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
import { TodoStore } from "@neighbourhoods/todo-applet";
import { TodoApplet } from "./todo-applet";
import { HolochainClient, CellClient } from '@holochain-open-dev/cell-client';

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


        const todoCell = appletAppInfo[0].installedAppInfo.cell_data.find(c => c.role_id === 'todo_lists') as InstalledCell;
        const todoStore = new TodoStore(
          new HolochainClient(appWebsocket),
          todoCell,
        )

        appletElement.todoStore = todoStore;
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
