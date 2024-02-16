import { property, state } from "lit/decorators.js";
import { ScopedRegistryHost } from "@lit-labs/scoped-registry-mixin";
import { LitElement, html, css, unsafeCSS } from "lit";
import { SensemakerStore, getLatestAssessment } from "@neighbourhoods/client";
import { EntryHash, encodeHashToBase64, decodeHashFromBase64 } from "@holochain/client";
import { StoreSubscriber } from "lit-svelte-stores";
import { get } from "svelte/store";

export class SensemakeResource extends ScopedRegistryHost(LitElement) {

    @property()
    public  sensemakerStore!: SensemakerStore

    @property()
    resourceEh!: EntryHash

    @property()
    resourceDefEh!: EntryHash

    render() {

      // TODO: put in the assessment widget tray here and construct delegates to pass into render blocks for widget
        return html`
            <div class="sensemake-resource">
                <slot></slot>
            </div>
        `
    }
    static get styles() {
        return [
            css`
            .sensemake-resource {
                display: flex;
                flex-direction: row;
                width: 100%;
                height: 100%;
            }
            ::slotted(*) {
                flex: 1;
            }
        `]};
    static get scopedElements() {
        return {
        }
    }
}
