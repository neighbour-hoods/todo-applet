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
    static get scopedElements() {
        return {
        }
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
                padding: 2px;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                margin: 2px;
                border-color: var(--nh-theme-accent-muted);
                border-style: solid;
                justify-content: center;
                align-items: center;
                position: relative;
                top: 50%;
                transform: translateY(-55%);
                font-size: 16px;
                color: var(--nh-theme-fg-default);
            }
            .display-box-wrapper {
                position: relative;
                align-items: center;
                justify-content: center;
            }
            `
            ]
    }
}

