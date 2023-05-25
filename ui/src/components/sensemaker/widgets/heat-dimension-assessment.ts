import { css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { EntryHash } from '@holochain/client';
import { AssessDimensionWidget, RangeValue, SensemakerStore, sensemakerStoreContext } from '@neighbourhoods/client';
import { contextProvided } from '@lit-labs/context';

export class HeatDimensionAssessment extends AssessDimensionWidget {
    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @state()
    sensemakerStore!: SensemakerStore;
    
    @property()
    resourceEh!: EntryHash

    @property()
    resourceDefEh!: EntryHash

    @property()
    dimensionEh!: EntryHash

    @property()
    methodEh!: EntryHash

    @property()
    isAssessedByMe = false;
    
    render() {
        
        return html`
                    <div class="heat-scale">
                        <div @click=${() => this.assessResource({ Integer: 0 })}>🧊</div>
                        <div @click=${() => this.assessResource({ Integer: 1 })}>❄️</div>
                        <div @click=${() => this.assessResource({ Integer: 2 })}>💧</div>
                        <div @click=${() => this.assessResource({ Integer: 3 })}>🌶️</div>
                        <div @click=${() => this.assessResource({ Integer: 4 })}>🔥</div>
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

