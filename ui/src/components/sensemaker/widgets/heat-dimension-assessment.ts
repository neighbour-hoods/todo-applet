import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { EntryHash } from '@holochain/client';
import { AssessDimensionWidget, RangeValue, SensemakerStore, sensemakerStoreContext } from '@neighbourhoods/client';
import { contextProvided } from '@lit-labs/context';
import { variables } from '../../../styles/variables';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { InputAssessmentWidgetDelegate, NHDelegateReceiver } from '@neighbourhoods/nh-launcher-applet';

@customElement('heat-dimension-assessment')
export class HeatDimensionAssessment extends ScopedElementsMixin(LitElement) implements NHDelegateReceiver<InputAssessmentWidgetDelegate> {
    @property()
    resourceEh!: EntryHash

    @property()
    resourceDefEh!: EntryHash

    @property()
    dimensionEh!: EntryHash

    @property()
    latestAssessment = null;
    
    private _delegate: InputAssessmentWidgetDelegate | null = null

    connectedCallback() {
        this._setupComponent()
    }
    set nhDelegate(delegate: InputAssessmentWidgetDelegate) {
        this._delegate = delegate;
        this._setupComponent()
    }
    async _setupComponent() {
        if (this._delegate) {
        }
    }

    handleClick(value: RangeValue) {
        this._delegate?.createAssessment({
            value,
            dimension_eh: this.dimensionEh,
            resource_eh: this.resourceEh,
            resource_def_eh: this.resourceDefEh,
            maybe_input_dataset: null,
        })
    }
    render() {
        
        return html`
                    <div class="heat-scale">
                        <span class="emoji-option" @click=${() => this.handleClick({ Integer: 0 })}>🧊</span>
                        <span class="emoji-option" @click=${() => this.handleClick({ Integer: 1 })}>❄️</span>
                        <span class="emoji-option" @click=${() => this.handleClick({ Integer: 2 })}>💧</span>
                        <span class="emoji-option" @click=${() => this.handleClick({ Integer: 3 })}>🌶️</span>
                        <span class="emoji-option" @click=${() => this.handleClick({ Integer: 4 })}>🔥</span>
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
            border-color: var(--nh-theme-accent-muted);
            border-style: solid;
            border-width: 1px;
            margin: 4px;
            font-size: 16px;
            align-items: center;
            justify-content: center;
            gap: 6px;
            flex-wrap: nowrap;
        }
        .emoji-option {
            display: flex;
        }
        .emoji-option:hover {
            cursor: pointer;
        }
    `]
    }
}

