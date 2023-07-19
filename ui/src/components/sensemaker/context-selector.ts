
import { contextProvided } from "@lit-labs/context";
import { property, state, query } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { sensemakerStoreContext, todoStoreContext } from "../../contexts";
import { TodoStore } from "../../todo-store";
import { get, writable } from "svelte/store";
import { ListItem } from "../list-item";
import { AddItem } from "../add-item";
import { List, ListItem as MWCListItem } from '@scoped-elements/material-web'
import { StoreSubscriber } from "lit-svelte-stores";
import { SensemakerStore, AppletConfig } from "@neighbourhoods/client";

export class ContextSelector extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @state()
    public  sensemakerStore!: SensemakerStore

    contexts: StoreSubscriber<AppletConfig> = new StoreSubscriber(this, () => this.sensemakerStore.appletConfig());

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