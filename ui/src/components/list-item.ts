import { property } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html } from "lit";

export class ListItem extends ScopedElementsMixin(LitElement) {
    @property()
    listName!: string

    render() {
        return html`
            <button type="button" @click=${this.dispatchSelectedList}>${this.listName}</button>
        `
    }

    dispatchSelectedList() {
        const selectedList = this.listName;
        if (selectedList) {
            const options = {
                detail: {selectedList},
                bubbles: true,
                composed: true
            };
            this.dispatchEvent(new CustomEvent('list-selected', options))
        }
    }
}