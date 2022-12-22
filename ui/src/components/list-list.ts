import { contextProvider, ContextProvider } from "@lit-labs/context";
import { property, state, query } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";

export class ListItem extends ScopedElementsMixin(LitElement) {
    render() {
        return html`
            <h1>hi</h1>
        `
    }
}