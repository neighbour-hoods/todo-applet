import { contextProvided } from "@lit-labs/context";
import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css, TemplateResult } from "lit";
import { WrappedTaskWithAssessment } from "../../types";
import { Checkbox, ListItem, CheckListItem } from '@scoped-elements/material-web'
import { sensemakerStoreContext, todoStoreContext } from "../../contexts";
import { CreateAssessmentInput, SensemakerStore } from "@neighbourhoods/client";
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

    @property()
    assessResourceWidget!: TemplateResult

    appletUIConfig = new StoreSubscriber(this, () => this.sensemakerStore.appletUIConfig())

    render() {
        return html`
            <div class="resource-wrapper" @create-assessment=${this.createAssessment}>
                <slot></slot>
                <display-assessment .resourceEh=${this.resourceEh} .dimensionEh=${this.appletUIConfig.value[encodeHashToBase64(this.resourceDefEh)].display_objective_dimension}></display-assessment>
                ${this.assessResourceWidget}
            </div>
        `
    }
    async createAssessment(e: CustomEvent) {
        console.log('handle create assessment in resource wrapper')
        const assessment: CreateAssessmentInput = e.detail.assessment;
        const assessmentEh = await this.sensemakerStore.createAssessment(assessment)
        console.log('created assessment', assessmentEh)
        console.log('resource eh', get(this.sensemakerStore.appletUIConfig())[encodeHashToBase64(this.resourceDefEh)].method_for_created_assessment)
        try {

            const objectiveAssessment = await this.sensemakerStore.runMethod({
                resource_eh: this.resourceEh,
                method_eh: get(this.sensemakerStore.appletUIConfig())[encodeHashToBase64(this.resourceDefEh)].method_for_created_assessment,
            })
            console.log('method output', objectiveAssessment)
        }
        catch (e) {
            console.log('method error', e)
        }
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

