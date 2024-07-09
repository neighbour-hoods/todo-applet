import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Assessment, DisplayDimensionWidget, RangeValueInteger } from '@neighbourhoods/client';
import { variables } from '../../../styles/variables';

@customElement('average-heat-dimension-display')
export class AverageHeatDimensionDisplay extends DisplayDimensionWidget {
    @property()
    assessment!: Assessment | null

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


