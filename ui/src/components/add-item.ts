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
            <div class="add-item-container">
                <input id="new-item-input" type="text" .value="${this.inputValue}" @input="${this.handleInput}">
                <button @click="${this.dispatchNewItem}">Add</button>
            </div>
        `
    }
    handleInput(event: Event) {
        this.inputValue = (event.target as HTMLInputElement).value;
    }
    updateInput(event: Event) {
        const input = event.target as HTMLInputElement;
        this.inputValue = input.value;
    }
    
    dispatchNewItem() {
        // const newValue = this.input.value;
        const newValue = this.inputValue;
        if (newValue) {
            const options = {
                detail: {newValue},
                bubbles: true,
                composed: true
            };
            this.dispatchEvent(new CustomEvent('new-item', options))
            this.input.value = ''
        }
        this.inputValue = ''
    }

    static get styles() {
        return [
            variables,
            css`
                .add-item-container {
                    display: flex;
                    flex-basis: 100%;
                    gap: 8px;
                }
                input {
                    background-color: var(--nh-theme-bg-subtle);
                    color: var(--nh-theme-fg-default);
                    height: 36px;
                    border-radius: var(--border-r-tiny);
                    font-size: 16px;
                    border: none;
                    display: flex;
                    flex: 1;
                }
                button {
                    display: flex;
                    border-radius: var(--border-r-tiny);
                    height: 36px;
                    background-color: var(--nh-theme-accent);
                    color: var(--nh-theme-fg-default);
                    font-size: 16px;
                    flex-basis: 54px;
                    border: 0px solid transparent;
                    text-align: center;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                }
                button:hover {
                    background-color: var(--nh-theme-accent-muted);
                }
                button:active {
                    box-shadow: 0px 0px 8px var(--nh-theme-accent);
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
