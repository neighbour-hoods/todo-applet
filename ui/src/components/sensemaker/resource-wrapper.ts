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

export class ResourceWrapper extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @state()
    public  sensemakerStore!: SensemakerStore

    @property()
    resourceEh!: EntryHash

    render() {

        const total_importance_dimension_eh = get(this.sensemakerStore.appletConfig()).dimensions["total_importance"];
        const importance_dimension_eh = get(this.sensemakerStore.appletConfig()).dimensions["importance"];
        return html`
            <div>
                <slot></slot>
            </div>
            <display-assessment .resourceEh=${this.resourceEh} .dimensionEh=${total_importance_dimension_eh}></display-assessment>
            <assess-resource .resourceEh=${this.resourceEh} .dimensionEh=${importance_dimension_eh}></assess-resource>
        `
    }
    static get scopedElements() {
        return {
            'display-assessment': DisplayAssessment,
            'assess-resource': AssessResource,
        }
    }
}

