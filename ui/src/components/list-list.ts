import { contextProvided } from "@lit-labs/context";
import { property, state, query } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { todoStoreContext } from "../contexts";
import { TodoStore } from "../todo-store";
import { get, writable } from "svelte/store";
import { ListItem } from "./list-item";
import { AddItem } from "./add-item";
import { List, ListItem as MWCListItem } from '@scoped-elements/material-web'
import { AppletConfig } from "../types";
import { StoreSubscriber } from "lit-svelte-stores";

export class ListList extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: todoStoreContext, subscribe: true })
    @state()
    public  todoStore!: TodoStore

    lists: StoreSubscriber<string[]> = new StoreSubscriber(this, () => this.todoStore.listLists());

    render() {
        // TODO: make the list of context dynamic to the applet config, rather than hardcoded - including the name
        return html`
            <div class="list-list-container">
                <mwc-list>
                    <mwc-list-item @click=${this.dispatchContextSelected}><b>IMPORTANT TASKS</b></mwc-list-item>
                    ${this.lists?.value?.map((listName) => html`
                        <list-item listName=${listName}></list-item> 
                    `)}
                    <add-item itemType="list" @new-item=${this.addNewList}></add-item>
                <mwc-list>
            </div>
        `
    }
    // dispatch an event when a context is selected
    dispatchContextSelected() {
        this.dispatchEvent(new CustomEvent('context-selected'))
    }
    async addNewList(e: CustomEvent) {
       await this.todoStore.createNewList(e.detail.newValue)
    }
    
    static get scopedElements() {
        return {
        'list-item': ListItem,
        'add-item': AddItem,
        'mwc-list': List,
        'mwc-list-item': MWCListItem,
        };
    }
    static styles = css`
        .list-list-container {
            display: flex;
            flex-direction: column;
        }
    `
}