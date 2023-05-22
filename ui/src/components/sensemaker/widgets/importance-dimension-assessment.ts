import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { EntryHash } from '@holochain/client';
import { Checkbox } from '@scoped-elements/material-web'
import { DimensionWidget } from './dimension-widget-interface';

export class ImportanceDimensionAssessment extends DimensionWidget {
    @property()
    resourceEh!: EntryHash

    @property()
    resourceDefEh!: EntryHash

    @property()
    dimensionEh!: EntryHash

    @property()
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
