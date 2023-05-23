import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { DisplayDimensionWidget } from './dimension-widget-interface';
import { Assessment, RangeValueInteger } from '@neighbourhoods/client';

export class TotalImportanceDimensionDisplay extends DisplayDimensionWidget {

    @property()
    assessment!: Assessment | null

    render() {
        return html`
                    <div>
                        (${this.assessment ? (this.assessment.value as RangeValueInteger).Integer : 0})
                    </div>
                `
    }
    static get scopedElements() {
        return {
        }
    }
    static styles = css`
        .heat-scale {
            display: flex;
            flex-direction: row;
        }
    `
}

