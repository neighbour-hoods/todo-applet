import { css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { EntryHash } from '@holochain/client';
import { Checkbox } from '@scoped-elements/material-web'
import { AssessDimensionWidget, RangeValue, SensemakerStore, sensemakerStoreContext } from '@neighbourhoods/client';
import { contextProvided } from '@lit-labs/context';

export class ImportanceDimensionAssessment extends AssessDimensionWidget {
    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @state()
    sensemakerStore!: SensemakerStore;
    
    @property()
    resourceEh!: EntryHash

    @property()
    resourceDefEh!: EntryHash

    @property()
    dimensionEh!: EntryHash

    @property()
    methodEh!: EntryHash

    @property()
    isAssessedByMe = false;

    render() {
        return html`
            <mwc-checkbox 
                ?disabled=${this.isAssessedByMe} 
                ?checked=${this.isAssessedByMe} 
                @click=${() => {console.log('resourceEh from widget implementation', this.resourceEh); !this.isAssessedByMe ? this.assessResource({
            Integer: 1
        }) : null}}
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
