import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { EntryHash } from '@holochain/client';
import { AssessDimensionWidget } from '@neighbourhoods/client';

export class HeatDimensionAssessment extends AssessDimensionWidget {
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
            flex-direction: column;
        }
    `
}

