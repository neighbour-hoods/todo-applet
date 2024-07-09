import { property } from "lit/decorators.js";
import { CSSResult, css, html } from "lit";
import { NHComponent } from "@neighbourhoods/design-system-components";
import { classMap } from 'lit/directives/class-map.js';

export class ListItem extends NHComponent {
    @property() listName!: string
    @property() selected: boolean = false;

    render() {
        return html`
            <span
                class="list-item${classMap({
                    'selected': !!this.selected})}"
                @click=${this.dispatchSelectedList}>
                ${this.listName}
            </span>
        `
    }

    dispatchSelectedList() {
        const selectedList = this.listName;
        if (selectedList) {
            const options = { detail: {selectedList}, bubbles: true, composed: true };
            (this as any).dispatchEvent(new CustomEvent('list-selected', options))
        }
    }

    static styles: CSSResult[] = [
        super.styles as CSSResult,
        css`
            .list-item.selected {
                background: rgb(110, 70, 204);
            }
            .list-item.selected:hover {
                cursor: initial;
            }
            .list-item:not(.selected):hover {
                background: rgba(110, 70, 204, 0.5);
            }
            .list-item {
                cursor: pointer;
                font-family: 'Manrope';
                font-weight: 400;
                margin: 0;
                border-radius: 8px;
                height: 2.5rem;  
                padding: 8px 16px;
                box-sizing: border-box;
                align-items: center;
                display: flex;
                flex: 1;
            }
        `,
    ];
}