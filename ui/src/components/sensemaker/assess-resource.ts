import { contextProvided } from '@lit-labs/context';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { LitElement, TemplateResult, css, html } from 'lit';
import { sensemakerStoreContext } from '../../contexts';
import { property, state } from 'lit/decorators.js';
import { CreateAssessmentInput, RangeValue, SensemakerStore } from '@neighbourhoods/client';
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

    // TODO: could pass in just this and not the dimensionEh and get it from the store instead
    @property()
    resourceDefEh!: EntryHash

    @property()
    dimensionEh!: EntryHash

    @state()
    isAssessedByMe = false;
    
    @property()
    assessResourceWidget!: TemplateResult

    // TODO: could probably change the .resourceAssessents to take in a resource hash and a dimension hash
    listTasksAssessments = new StoreSubscriber(this, () => this.sensemakerStore.resourceAssessments());

    render() {
        return this.assessResourceWidget
    }


    async createAssessmet(value: RangeValue) {
        const assessment: CreateAssessmentInput = {
            // this value should be more dynamic based on which assessments the ui should allow to be created
            value,
            dimension_eh: this.dimensionEh,
            resource_eh: this.resourceEh,
            resource_def_eh: this.resourceDefEh,
            maybe_input_dataset: null,

        }
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
    static get scopedElements() {
        return {
            'mwc-checkbox': Checkbox,
        }
    }
    static styles = css`
        .heat-scale {
            display: flex;
            flex-direction: row;
        }
    `
}