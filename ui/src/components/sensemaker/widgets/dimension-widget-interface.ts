import { TemplateResult } from 'lit';
import { CreateAssessmentInput, RangeValue } from '@neighbourhoods/client';
import { EntryHash } from '@holochain/client';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { LitElement } from 'lit';

export interface IDimensionWidget {
    resourceEh: EntryHash
    resourceDefEh: EntryHash
    dimensionEh: EntryHash
    isAssessedByMe: boolean
    render(): TemplateResult
    dispatchCreateAssessment(value: RangeValue): void
}

export abstract class DimensionWidget extends ScopedElementsMixin(LitElement) implements IDimensionWidget {
    abstract resourceEh: EntryHash
    abstract resourceDefEh: EntryHash
    abstract dimensionEh: EntryHash
    abstract isAssessedByMe: boolean
    abstract render(): TemplateResult
    dispatchCreateAssessment(value: RangeValue): void {
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
}