import { css, html } from 'lit';
import { OutputAssessmentControl } from '@neighbourhoods/client';
import { RangeValueInteger } from '@neighbourhoods/client';
import { variables } from '../../../styles/variables';

export class TotalImportanceDimensionDisplay extends OutputAssessmentControl {

    render() {
        return html`
                    <div class="display-box-wrapper">
                        <div class="display-box">
                            (${this.assessment ? (this.assessment.value as RangeValueInteger).Integer : 0})
                        </div>
                    </div>
                `
    }

    static get styles() {
        return [
            variables,
            css`
            .heat-scale {
                display: flex;
                flex-direction: row;
            }
            .display-box {
                background-color: var(--nh-theme-accent-muted);
                border-radius: 50%;
                border-color: var(--nh-theme-accent-muted);
                border-style: solid;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: center;

                width: 36px;
                height: 36px;
                font-size: .75rem;
                line-height: 1.5rem;
            }

            .display-box-wrapper {
                margin: 0 auto;
                display: grid;
                place-content: center;
                box-sizing: border-box;
                width: 48px;
                height: 48px;
            }
            `
            ]
    }
}

