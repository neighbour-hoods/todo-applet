import { property } from "lit/decorators.js";
import { ScopedRegistryHost } from "@lit-labs/scoped-registry-mixin";
import { LitElement, css, html } from "lit";
import { ListItem as MWCListItem } from '@scoped-elements/material-web'
import { variables } from "../styles/variables";

export class ListItem extends ScopedRegistryHost(LitElement) {
    @property()
    listName!: string

    render() {
        return html`
            <mwc-list-item class="list-item" @click=${this.dispatchSelectedList}>${this.listName}</mwc-list-item>
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

    
    static get styles() {
        return [
            variables,
            css`
                .list-item {
                    background-color: var(--nh-theme-bg-surface);
                    color: var(--nh-theme-fg-default);
                    border-radius: var(--border-r-small);
                    margin: 4px;
                }
            `
        ]
    }
}