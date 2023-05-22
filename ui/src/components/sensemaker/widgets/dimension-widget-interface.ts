import { TemplateResult } from 'lit';
import { Assessment, CreateAssessmentInput, RangeValue } from '@neighbourhoods/client';
import { EntryHash } from '@holochain/client';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { LitElement } from 'lit';

interface IDimensionWidget {
    resourceEh: EntryHash
    resourceDefEh: EntryHash
    dimensionEh: EntryHash
    render(): TemplateResult
}

type IAssessDimensionWidget = IDimensionWidget & {
    isAssessedByMe: boolean
    dispatchCreateAssessment(value: RangeValue): void
}

type IDisplayDimensionWidget = IDimensionWidget & {
    assessment: Assessment
}

export abstract class AssessDimensionWidget extends ScopedElementsMixin(LitElement) implements IAssessDimensionWidget {
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

export abstract class DisplayDimensionWidget extends ScopedElementsMixin(LitElement) implements IDisplayDimensionWidget {
    abstract resourceEh: EntryHash
    abstract resourceDefEh: EntryHash
    abstract dimensionEh: EntryHash
    abstract assessment: Assessment
    abstract render(): TemplateResult
}