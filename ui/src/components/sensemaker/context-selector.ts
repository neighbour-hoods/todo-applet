
import { property, state } from "lit/decorators.js";
import { ScopedRegistryHost } from "@lit-labs/scoped-registry-mixin";
import { LitElement, html, css } from "lit";
import { get, derived } from "svelte/store";
import { ListItem } from "../list-item";
import { List } from '@scoped-elements/material-web'
import { StoreSubscriber } from "lit-svelte-stores";
import { SensemakerStore, AppletInfo, CulturalContext } from "@neighbourhoods/client";
import { EntryHashB64 } from "@holochain/client";

export class ContextSelector extends ScopedRegistryHost(LitElement) {
    @property()
    appId!: string;

    @property()
    public sensemakerStore!: SensemakerStore

    contexts: StoreSubscriber<Map<EntryHashB64, CulturalContext>> = new StoreSubscriber(this, () => {
      console.log('installAppId', this.appId)
      return derived(this.sensemakerStore.contexts, (culturalContexts) => {
        return culturalContexts.get(this.appId)!;
      })
    });

    render() {
        console.log('rendering context selector', get(this.sensemakerStore.contexts), this.contexts?.value)
        return html`
            <div class="list-list-container">
                <mwc-list>
                    ${Array.from(this.contexts?.value?.values()).map((culturalContext) => html`
                        <list-item listName=${culturalContext.name}></list-item>
                    `)}
                <mwc-list>
            </div>
        `
    }

    dispatchContextSelected() {
        this.dispatchEvent(new CustomEvent('context-selected'))
    }

    static get elementDefinitions() {
        return {
        'list-item': ListItem,
        'mwc-list': List
        };
    }
    static styles = css`
        .list-list-container {
            display: flex;
            flex-direction: column;
            width: 100%;
        }
    `
}
