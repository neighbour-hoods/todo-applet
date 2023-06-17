import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { EntryHash } from '@holochain/client';
import { AssessDimensionWidget, RangeValue, SensemakerStore, sensemakerStoreContext } from '@neighbourhoods/client';
import { contextProvided } from '@lit-labs/context';
import { variables } from '../../../styles/variables';

@customElement('heat-dimension-assessment')
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
    latestAssessment = null;
    
    render() {
        
        return html`
                    <div class="heat-scale">
                        <span class="emoji-option" @click=${() => this.assessResource({ Integer: 0 })}>🧊</span>
                        <span class="emoji-option" @click=${() => this.assessResource({ Integer: 1 })}>❄️</span>
                        <span class="emoji-option" @click=${() => this.assessResource({ Integer: 2 })}>💧</span>
                        <span class="emoji-option" @click=${() => this.assessResource({ Integer: 3 })}>🌶️</span>
                        <span class="emoji-option" @click=${() => this.assessResource({ Integer: 4 })}>🔥</span>
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
            background-color: var(--nh-theme-bg-muted);
            padding: 2px;
            border-radius: var(--border-r-tiny);
            display: block;
            margin: 2px;
            border-color: var(--nh-theme-accent-muted);
            border-style: solid;
            border-width: 1px;
            margin: 4px;
            font-size: 16px;
        }
        .emoji-option {
            position: relative;
            display: inline-block;
            top: 50%;
            transform: translateY(-50%);
        }
        .emoji-option:hover {
            cursor: pointer;
        }
    `]
    }
}

