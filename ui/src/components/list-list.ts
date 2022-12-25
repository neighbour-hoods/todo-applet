import { contextProvided, contextProvider, ContextProvider } from "@lit-labs/context";
import { property, state, query } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { todoStoreContext } from "../contexts";
import { TodoStore } from "../todo-store";
import { get } from "svelte/store";
import { ListItem } from "./list-item";
import { AddItem } from "./add-item";

export class ListList extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: todoStoreContext, subscribe: true })
    @property({attribute: false})
    public  todoStore!: TodoStore
    render() {
        console.log(get(this.todoStore.listLists()))
        const listList = html`
        ${get(this.todoStore.listLists()).map((listName) => html`
           <list-item listName=${listName}></list-item> 
        `)}
        `
        return html`
            <div class="list-list-container">
                ${listList}
                <add-item itemType="list" @new-item=${this.addNewList}></add-item>
            </div>
        `
    }
    async addNewList(e: CustomEvent) {
       console.log(e.detail.newValue)
       await this.todoStore.createNewList(e.detail.newValue)
       console.log(get(this.todoStore.listLists()))
       const all = await this.todoStore.fetchAllTasks()
       console.log(all)
    }
    static get scopedElements() {
        return {
        'list-item': ListItem,
        'add-item': AddItem,
        };
    }
    static styles = css`
        .list-list-container {
            display: flex;
            flex-direction: column;
        }
    `
}