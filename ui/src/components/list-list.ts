import { contextProvided } from "@lit-labs/context";
import { property, state, query } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { todoStoreContext } from "../contexts";
import { TodoStore } from "../todo-store";
import { get } from "svelte/store";
import { ListItem } from "./list-item";
import { AddItem } from "./add-item";
import { List, ListItem as MWCListItem } from '@scoped-elements/material-web'
import { AppletConfig } from "../types";
import { StoreSubscriber } from "lit-svelte-stores";

export class ListList extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: todoStoreContext, subscribe: true })
    @property({attribute: false})
    public  todoStore!: TodoStore

    list = new StoreSubscriber(this, this.todoStore.listLists)
    
    @state()
    listList = html``
    
    
    render() {
        console.log(get(this.todoStore.listLists()))
        // this.updateListList()
        return html`
            <div class="list-list-container">
                <mwc-list>
                    <mwc-list-item @click=${this.dispatchContextSelected}><b>IMPORTANT TASKS</b></mwc-list-item>
                    ${this.listList}
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
        // this.updateListList()
    }
    updateListList() {
        // TODO: rather than updating the list manually like this, use subscriptions on the svelte store
        this.listList = html`
        ${get(this.todoStore.listLists()).map((listName) => html`
           <list-item listName=${listName}></list-item> 
        `)}
        `
    }
    updateSelectedList(e: CustomEvent) {

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