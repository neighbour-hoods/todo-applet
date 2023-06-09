import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { EntryHash } from '@holochain/client';
import { Checkbox } from '@scoped-elements/material-web'
import { AssessDimensionWidget, RangeValue, SensemakerStore, sensemakerStoreContext } from '@neighbourhoods/client';
import { contextProvided } from '@lit-labs/context';

@customElement('importance-dimension-assessment')
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
    latestAssessment = null;

    render() {
        // return html`
        //     <div class="importance-toggle">
        //         <mwc-checkbox 
        //             ?disabled=${this.isAssessedByMe} 
        //             ?checked=${this.isAssessedByMe} 
        //             @click=${() => {console.log('resourceEh from widget implementation', this.resourceEh); !this.isAssessedByMe ? this.assessResource({
        //         Integer: 1
        //     }) : null}}
        //         ></mwc-checkbox>
        return html`
            <div class="importance-toggle">
                <input 
                    type="checkbox" 
                    name="myCheckbox" 
                    value="important" 
                    ?checked=${this.latestAssessment}
                    ?disabled=${this.latestAssessment} 
                    @click=${() => {console.log('resourceEh from widget implementation', this.resourceEh); !this.latestAssessment ? this.assessResource({
                Integer: 1
            }) : null}}
                >
            </div>
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
