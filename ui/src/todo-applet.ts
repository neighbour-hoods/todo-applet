// import { contextProvider, ContextProvider } from "@lit-labs/context";
import { property, state, query, customElement } from "lit/decorators.js";
// import {
//   ProfilesStore,
//   profilesStoreContext,
// } from "@holochain-open-dev/profiles";
import { InstalledAppInfo, AppWebsocket } from "@holochain/client";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { CircularProgress } from "@scoped-elements/material-web";
import { LitElement, html, css } from "lit";
import { InstalledAppletInfo, sensemakerStoreContext, SensemakerStore, Dimension } from "@lightningrodlabs/we-applet";

export class TodoApplet extends ScopedElementsMixin(LitElement) {
  // @property()
  // appWebsocket!: AppWebsocket;

  // // @contextProvider({ context: sensemakerStoreContext })
  // @property()
  // sensemakerStore!: SensemakerStore;

  // @property()
  // appletAppInfo!: InstalledAppletInfo[];

  // @state()
  // loaded = false;

  // async firstUpdated() {
  //   // TODO: Initialize any store that you have and create a ContextProvider for it
  //   //
  //   // eg:
  //   // new ContextProvider(this, todoContext, new TodoStore(cellClient, store));
  //   console.log('first updated')
  //   this.loaded = true;
  //   const integerRange = {
  //     "name": "10-scale",
  //     "kind": {
  //       "Integer": { "min": 0, "max": 10 }
  //     },
  //   };

  //   const dimension: Dimension = {
  //     name: "test",
  //     range: integerRange
  //   }
  //   const dimensionHash = await this.sensemakerStore.createDimension(dimension)
  //   console.log('dimension hash', dimensionHash)
  // }
  // static styles = css`
  //   .completed {
  //     text-decoration-line: line-through;
  //     color: #777;
  //   }
  // `;

  // @state()
  // private _listItems = [
  //   { text: 'Make to-do list again', completed: true },
  //   { text: 'Complete Lit tutorial', completed: false }
  // ];

  // @property()
  // hideCompleted = false;

  // toggleCompleted(item: ToDoItem) {
  //   item.completed = !item.completed;
  //   this.requestUpdate();
  // }

  // setHideCompleted(e: Event) {
  //   this.hideCompleted = (e.target as HTMLInputElement).checked;
  // }

  // // @query('#newitem')
  // // input!: HTMLInputElement;

  // addToDo() {
  //   // this._listItems = [...this._listItems,
  //   // { text: this.input.value, completed: false }];
  //   // this.input.value = '';
  // }
  render() {
    // const items = this._listItems;
    // const todos = html`
    //   <ul>
    //     ${items.map((item) =>
    //   html`
    //         <li
    //             class=${item.completed ? 'completed' : ''}
    //             @click=${() => this.toggleCompleted(item)}>
    //           ${item.text}
    //         </li>`
    // )}
    //   </ul>
    // `;
    // if (!this.loaded)
    //   return html`<div
    //     style="display: flex; flex: 1; flex-direction: row; align-items: center; justify-content: center"
    //   >
    //     <mwc-circular-progress></mwc-circular-progress>
    //   </div>`;

    // return html`
    //   <h2>To Do</h2>
    //   ${todos}
    //   <input id="newitem" aria-label="New item">
    //   <button @click=${this.addToDo}>Add</button>
    //   <br>
    //   <label>
    //     <input type="checkbox"
    //       @change=${this.setHideCompleted}
    //       ?checked=${this.hideCompleted}>
    //     Hide completed
    //   </label>
    // `;
    return html`<h1>the applet</h1>`
  }

  static get scopedElements() {
    return {
      "mwc-circular-progress": CircularProgress,
      // TODO: add any elements that you have in your applet
    };
  }

  // static styles = [
  //   css`
  //     :host {
  //       display: flex;
  //       flex: 1;
  //     }
  //   `,
  // ];
}

type ToDoItem = {
  text: string,
  completed: boolean
};

// @customElement('todo-list')
// export class ToDoList extends LitElement {

// }