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
        return html`
            <div class="list-list-container">
                <mwc-list>
                    ${this.lists?.value?.map((listName) => html`
                        <list-item class="todo-list-list-item" listName=${listName}></list-item> 
                    `)}
                <mwc-list>
            </div>
        `
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
    static get styles() {
        return [
            css`
                .list-list-container {
                    display: flex;
                    flex-direction: column;
                }
                .todo-list-list-item:hover {
                    background-color: var(--nh-theme-accent-muted);
                }


            `
        ]
    } 
}