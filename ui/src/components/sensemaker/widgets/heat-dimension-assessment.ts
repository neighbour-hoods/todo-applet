import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { LitElement, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { CreateAssessmentInput, RangeValue } from '@neighbourhoods/client';
import { EntryHash } from '@holochain/client';

export class HeatDimensionAssessment extends ScopedElementsMixin(LitElement) {
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
                    <div class="heat-scale">
                        <div @click=${() => this.dispatchCreateAssessment({ Integer: 0 })}>🧊</div>
                        <div @click=${() => this.dispatchCreateAssessment({ Integer: 1 })}>❄️</div>
                        <div @click=${() => this.dispatchCreateAssessment({ Integer: 2 })}>💧</div>
                        <div @click=${() => this.dispatchCreateAssessment({ Integer: 3 })}>🌶️</div>
                        <div @click=${() => this.dispatchCreateAssessment({ Integer: 4 })}>🔥</div>
                    </div>
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
        }
    }
    static styles = css`
        .heat-scale {
            display: flex;
            flex-direction: row;
        }
    `
}

