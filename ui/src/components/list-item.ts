import { property } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html } from "lit";

export class ListItem extends ScopedElementsMixin(LitElement) {
    @property()
    listName!: string

    render() {
        return html`
            <button type="button">${this.listName}</button>
        `
    }
}