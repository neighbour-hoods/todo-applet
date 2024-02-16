import { css, html } from 'lit';
import { OutputAssessmentControl, RangeValueInteger } from '@neighbourhoods/client';
import { variables } from '../../../styles/variables';

export class AverageHeatDimensionDisplay extends OutputAssessmentControl {
    render() {
        const latestAssessmentValue = this.assessment ? (this.assessment.value as RangeValueInteger).Integer : 0
        let emoji = "🧊";
        if (latestAssessmentValue > 3) {
            emoji = "🔥";
        }
        else if (latestAssessmentValue > 2) {
            emoji = "🌶️";
        }
        else if (latestAssessmentValue > 1) {
            emoji = "💧";
        }
        else if (latestAssessmentValue > 0) {
            emoji = "❄️";
        }
        else {
            emoji = "🧊";
        }
        return html`
                <div class="display-box-wrapper">
                    <div class="display-box">
                        ${emoji}
                    </div>
                </div>
                `
    }
    static get styles() {
        return [
            variables,
            css`
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


