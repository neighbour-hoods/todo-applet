import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { LitElement, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { CreateAssessmentInput, RangeValue } from '@neighbourhoods/client';
import { EntryHash } from '@holochain/client';
import { Checkbox } from '@scoped-elements/material-web'

export class ImportanceDimensionAssessment extends ScopedElementsMixin(LitElement) {
    @property()
    resourceEh!: EntryHash

    // TODO: could pass in just this and not the dimensionEh and get it from the store instead
    @property()
    resourceDefEh!: EntryHash

    @property()
    dimensionEh!: EntryHash

    @state()
    isAssessedByMe = false;

    render() {
        return html`
            <mwc-checkbox 
                ?disabled=${this.isAssessedByMe} 
                ?checked=${this.isAssessedByMe} 
                @click=${() => !this.isAssessedByMe ? this.dispatchCreateAssessment({
            Integer: 1
        }) : null}
            ></mwc-checkbox>
        `
    }


    dispatchCreateAssessment(value: RangeValue) {
        const assessment: CreateAssessmentInput = {
            value,
            dimension_eh: this.dimensionEh,
            resource_eh: this.resourceEh,
            resource_def_eh: this.resourceDefEh,
            maybe_input_dataset: null,

        }
        const options = {
            detail: { assessment },
            bubbles: true,
            composed: true
        };
        this.dispatchEvent(new CustomEvent('create-assessment', options))
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
