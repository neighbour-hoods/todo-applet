import { property, query, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html } from "lit";

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
            <input id="new-item-input" placeholder=${`new ${this.itemType}`}>
            <button type="buton" @click=${this.dispatchNewItem}>add+</button>
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
}
