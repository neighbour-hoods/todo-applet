import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { LitElement, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { CreateAssessmentInput, RangeValue } from '@neighbourhoods/client';
import { EntryHash } from '@holochain/client';
import { DimensionWidget } from './dimension-widget-interface';

export class HeatDimensionAssessment extends DimensionWidget {
    @property()
    resourceEh!: EntryHash

    @property()
    resourceDefEh!: EntryHash

    @property()
    dimensionEh!: EntryHash

    @property()
    isAssessedByMe = false;

    render() {
        return html`
                    <div class="heat-scale">
                        <div @click=${() => this.dispatchCreateAssessment({ Integer: 0 })}>🧊</div>
                        <div @click=${() => this.dispatchCreateAssessment({ Integer: 1 })}>❄️</div>
                        <div @click=${() => this.dispatchCreateAssessment({ Integer: 2 })}>💧</div>
                        <div @click=${() => this.dispatchCreateAssessment({ Integer: 3 })}>🌶️</div>
                        <div @click=${() => this.dispatchCreateAssessment({ Integer: 4 })}>🔥</div>
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

