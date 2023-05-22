import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { EntryHash } from '@holochain/client';
import { DisplayDimensionWidget } from './dimension-widget-interface';
import { Assessment, RangeValueInteger } from '@neighbourhoods/client';

export class ImportanceDimensionDisplay extends DisplayDimensionWidget {
    @property()
    resourceEh!: EntryHash

    @property()
    resourceDefEh!: EntryHash

    @property()
    dimensionEh!: EntryHash

    @property()
    assessment!: Assessment

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


