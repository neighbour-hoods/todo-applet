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
        return html`
                    <div>
                        (${this.assessment ? (this.assessment.value as RangeValueInteger).Integer : 0})
                    </div>
                `
    }
}

