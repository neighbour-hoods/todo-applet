import { property } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html } from "lit";
import { ListItem as MWCListItem } from '@scoped-elements/material-web'

export class ListItem extends ScopedElementsMixin(LitElement) {
    @property()
    listName!: string

    render() {
        return html`
            <mwc-list-item @click=${this.dispatchSelectedList}>${this.listName}</mwc-list-item>
        `
    }

    // dispatch an event to update the currently selected list
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

    static get scopedElements() {
        return {
            'mwc-list-item': MWCListItem,
        }
    }
}