import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { EntryHash } from '@holochain/client';
import { Checkbox } from '@scoped-elements/material-web'
import { AssessDimensionWidget, RangeValue, SensemakerStore, sensemakerStoreContext } from '@neighbourhoods/client';
import { contextProvided } from '@lit-labs/context';
import { variables } from '../../../styles/variables';

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
            <label class="star-checkbox">
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
                <span class="star"></span>
            </label>
            </div>
          
        `
    }

    static get scopedElements() {
        return {
            'mwc-checkbox': Checkbox,
        }
    }
    static get styles() {
        return [
            variables,
            css`
            .importance-toggle {
                display: flex;
                flex-direction: row;
                background-color: var(--nh-theme-bg-muted);
                padding: 2px;
                border-radius: var(--border-r-tiny);
                display: block;
                margin: 2px;
                border-color: var(--nh-theme-accent-muted);
                border-style: solid;
                border-width: 1px;
                margin: 4px;
                font-size: 16px;
                width: 40px;
            }
            .star-checkbox {
                display: inline-block;
                position: relative;
                cursor: pointer;
                top: 50%;
                transform: translateY(-50%);
              }
              
              .star-checkbox input[type="checkbox"] {
                display: none;
              }
              
              .star-checkbox .star {
                display: inline-block;
                width: 20px;
                height: 20px;
                background-color: #ccc;
                clip-path: polygon(
                  50% 0%,
                  63% 38%,
                  100% 38%,
                  69% 59%,
                  82% 100%,
                  50% 75%,
                  18% 100%,
                  31% 59%,
                  0% 38%,
                  37% 38%
                );
              }
              
              .star-checkbox input[type="checkbox"]:checked + .star {
                background-color: #ffdd00; /* Replace with your desired color */
              }
        `]
    }
}
