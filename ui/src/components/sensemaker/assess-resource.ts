import { contextProvided } from '@lit-labs/context';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { LitElement, html } from 'lit';
import { sensemakerStoreContext } from '../../contexts';
import { property, state } from 'lit/decorators.js';
import { CreateAssessmentInput, RangeValueInteger, SensemakerStore, getLargestAssessment } from '@neighbourhoods/client';
import { EntryHash, encodeHashToBase64 } from '@holochain/client';
import { StoreSubscriber } from 'lit-svelte-stores';
import { Checkbox } from '@scoped-elements/material-web'
import { get } from "svelte/store";
export class AssessResource extends ScopedElementsMixin(LitElement) {
    // context provided sensemaker store
    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @state()
    sensemakerStore!: SensemakerStore

    @property()
    resourceEh!: EntryHash

    @property()
    dimensionEh!: EntryHash

    @state()
    isAssessedByMe = false;
    
    // TODO: could probably change the .resourceAssessents to take in a resource hash and a dimension hash
    listTasksAssessments = new StoreSubscriber(this, () => this.sensemakerStore.resourceAssessments());

    render() {
        const resourceAssessments = this.listTasksAssessments.value[encodeHashToBase64(this.resourceEh)];
        
        console.log('resourceAssessments', resourceAssessments);
        const myResourceAssessmentsAlongDimension = resourceAssessments ? resourceAssessments.filter(assessment => {
            return encodeHashToBase64(assessment.author) === encodeHashToBase64(this.sensemakerStore.myAgentPubKey) 
        }) : [];
        console.log('myResourceAssessmentsAlongDimension', myResourceAssessmentsAlongDimension)
        this.isAssessedByMe = myResourceAssessmentsAlongDimension.length > 0 ? true : false;
        return html`
            <mwc-checkbox ?disabled=${this.isAssessedByMe} ?checked=${this.isAssessedByMe} @click=${this.createAssessmet}></mwc-checkbox>
        `
    }

    static get scopedElements() {
        return {
            'mwc-checkbox': Checkbox,
        }
    }

    async createAssessmet() {
        if (!this.isAssessedByMe) {
            const assessment: CreateAssessmentInput = {
                // this value should be more dynamic based on which assessments the ui should allow to be created
                value: {
                    Integer: 1
                },
                dimension_eh: this.dimensionEh,
                resource_eh: this.resourceEh,
                resource_def_eh: get(this.sensemakerStore.appletConfig()).resource_defs["task_item"],
                maybe_input_dataset: null,
        
            }
            const assessmentEh = await this.sensemakerStore.createAssessment(assessment)
            const objectiveAssessment = await this.sensemakerStore.runMethod({
                resource_eh: this.resourceEh,
                method_eh: get(this.sensemakerStore.appletConfig()).methods["total_importance_method"],
            })
        }
    }
}