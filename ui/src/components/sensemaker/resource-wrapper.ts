import { contextProvided } from "@lit-labs/context";
import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css, TemplateResult } from "lit";
import { sensemakerStoreContext } from "../../contexts";
import { SensemakerStore } from "@neighbourhoods/client";
import { EntryHash } from "@holochain/client";
import { DisplayAssessment } from "./display-assessment";
import { AssessResource } from "./assess-resource";
import { StoreSubscriber } from "lit-svelte-stores";

export class ResourceWrapper extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @state()
    public  sensemakerStore!: SensemakerStore

    @property()
    resourceEh!: EntryHash

    @property()
    resourceDefEh!: EntryHash

    @property()
    assessDimensionWidget!: TemplateResult

    @property()
    displayDimensionWidget!: TemplateResult

    appletUIConfig = new StoreSubscriber(this, () => this.sensemakerStore.appletUIConfig())

    render() {
        return html`
            <div class="resource-wrapper">
                <slot></slot>
                ${this.displayDimensionWidget}
                ${this.assessDimensionWidget}
            </div>
        `
    }
    static styles = css`
          .resource-wrapper {
            display: flex;
            flex-direction: row;
          }
        `;
    static get scopedElements() {
        return {
            'display-assessment': DisplayAssessment,
            'assess-resource': AssessResource,
        }
    }
}

