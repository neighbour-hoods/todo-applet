import { property, query, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, css, html } from "lit";
import { TextField, Button } from '@scoped-elements/material-web'
import { variables } from "../styles/variables";

export class AddItem extends ScopedElementsMixin(LitElement) {
    @property()
    itemType!: string

    @property()
    @state()
    inputValue: string = ''

    @query('#new-item-input')
    input!: HTMLInputElement;

    render() {
        return html`
            <mwc-textfield id="new-item-input" placeholder=${`new ${this.itemType}`}></mwc-textfield>
            <mwc-button outlined=true @click=${this.dispatchNewItem}>add+</mwc-button>
        `
    }

    updateInput(event: Event) {
        const input = event.target as HTMLInputElement;
        this.inputValue = input.value;
    }
    
    dispatchNewItem() {
        const newValue = this.input.value;
        if (newValue) {
            const options = {
                detail: {newValue},
                bubbles: true,
                composed: true
            };
            this.dispatchEvent(new CustomEvent('new-item', options))
            this.input.value = ''
        }
    }

    static get styles() {
        return [
            variables,
            css`
                #new-item-input {
                    --mdc-theme-primary: var(--nh-theme-fg-default);
                    --mdc-text-field-fill-color: var(--nh-theme-bg-surface);
                    color: var(--nh-theme-fg-default);
                }
                #new-item-input::part(input) {
                    color: white;
                }
                #new-item-input::placeholder {
                    color: var(--nh-theme-fg-default);
                }
            `
        ]
    }
    static get scopedElements() {
        return {
            'mwc-textfield': TextField,
            'mwc-button': Button,
        }
    }
}
