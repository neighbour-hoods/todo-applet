import { contextProvided } from "@lit-labs/context";
import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { WrappedTaskWithAssessment } from "../../types";
import { Checkbox, ListItem, CheckListItem } from '@scoped-elements/material-web'
import { sensemakerStoreContext, todoStoreContext } from "../../contexts";
import { SensemakerStore } from "@neighbourhoods/client";
import { EntryHash, encodeHashToBase64 } from "@holochain/client";
import { DisplayAssessment } from "./display-assessment";
import { get } from "svelte/store";
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

    appletUIConfig = new StoreSubscriber(this, () => this.sensemakerStore.appletUIConfig())

    render() {
        return html`
            <div class="resource-wrapper">
                <slot></slot>
                <display-assessment .resourceEh=${this.resourceEh} .dimensionEh=${this.appletUIConfig.value[encodeHashToBase64(this.resourceDefEh)].display_objective_dimension}></display-assessment>
                <assess-resource .resourceEh=${this.resourceEh} .dimensionEh=${this.appletUIConfig.value[encodeHashToBase64(this.resourceDefEh)].create_assessment_dimension}></assess-resource>
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

