
import { contextProvided } from "@lit-labs/context";
import { property, state, query } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { sensemakerStoreContext, todoStoreContext } from "../../contexts";
import { TodoStore } from "../../todo-store";
import { get, writable, derived } from "svelte/store";
import { ListItem } from "../list-item";
import { AddItem } from "../add-item";
import { List, ListItem as MWCListItem } from '@scoped-elements/material-web'
import { StoreSubscriber } from "lit-svelte-stores";
import { SensemakerStore, AppletConfig } from "@neighbourhoods/client";
import { AppletInfo } from "@neighbourhoods/nh-launcher-applet";

export class ContextSelector extends ScopedElementsMixin(LitElement) {
    @property()
    appletAppInfo!: AppletInfo[];



    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @state()
    public  sensemakerStore!: SensemakerStore

    contexts: StoreSubscriber<AppletConfig> = new StoreSubscriber(this, () => {
        
      const todoAppletInfo = this.appletAppInfo[0];
      const installAppId = todoAppletInfo.appInfo.installed_app_id;
      return derived(this.sensemakerStore.appletConfigs(), (appletConfigs) => {
        return appletConfigs[installAppId]
      })
    });

    render() {
        return html`
            <div class="list-list-container">
                <mwc-list>
                    ${Object.keys(this.contexts?.value?.cultural_contexts).map((contextName) => html`
                        <list-item listName=${contextName}></list-item> 
                    `)}
                <mwc-list>
            </div>
        `
    }

    dispatchContextSelected() {
        this.dispatchEvent(new CustomEvent('context-selected'))
    }
    
    static get scopedElements() {
        return {
        'list-item': ListItem,
        'mwc-list': List,
        'mwc-list-item': MWCListItem,
        };
    }
    static styles = css`
        .list-list-container {
            display: flex;
            flex-direction: column;
            width: 100%;
        }
    `
}