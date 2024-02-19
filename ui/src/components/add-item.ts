import { NHComponent, NHButton, NHTextInput } from "@neighbourhoods/design-system-components";
import { property, query } from "lit/decorators.js";
import { CSSResult, css, html } from "lit";

export class AddItem extends NHComponent {
    @property() itemType!: string

    @query('#new-item-input') private _input!: NHTextInput;

    render() {
        return html`
            <div class="add-item-container">
                <nh-text-input class="new-item-input" .size=${"auto"} .name=${"add-" + this.itemType} .label=${""} .placeholder=${"Add a " + this.itemType}></nh-text-input>
                <nh-button .size=${"auto"} @click=${() => {this.dispatchNewItem(); this._input.reset()}}>Add</nh-button>
            </div>
        `
    }
    
    dispatchNewItem() {
        const newValue = this._input.value;
        if (newValue && newValue !== '') {
            const options = { detail: {newValue}, bubbles: true, composed: true };
            this.dispatchEvent(new CustomEvent('new-item', options))
        }
    }

    static elementDefinitions = {
        'nh-button': NHButton,
        "nh-text-input": NHTextInput,
    }

    static styles: CSSResult[] = [
        css`
            .add-item-container {
                display: flex;
                gap: calc(1px * var(--nh-spacing-lg));
                align-items: center;
            }
            .add-item-container > * {
                display: flex;
                align-items: center;
                border-radius: 12px;
                background: #18151B;
            }
            nh-text-input {
                flex: 2;
            }
            nh-button {
                flex: 1;
            }
        `
    ]
}
