import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { Assessment, DisplayDimensionWidget, RangeValueInteger } from '@neighbourhoods/client';

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
                    <div>
                        (${emoji})
                    </div>
                `
    }
}


