import { css, html } from 'lit';
import { property, queryAll, state } from 'lit/decorators.js';
import { EntryHash } from '@holochain/client';
import {
  InputAssessmentControl, RangeValueInteger,
} from '@neighbourhoods/client';
import { variables } from '../../../styles/variables';
import { NHIconContainer } from '@neighbourhoods/design-system-components';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { NHDelegateReceiver, InputAssessmentWidgetDelegate } from '@neighbourhoods/client';

export class HeatDimensionAssessment extends ScopedRegistryHost(InputAssessmentControl) implements NHDelegateReceiver<InputAssessmentWidgetDelegate> {
  @state() loading = true;

  /**
   * There is a 1:1 mapping between the index of this array and the value used for the assessment
   */
  icons = ['🧊', '❄️', '💧', '🌶️', '🔥']

  assessor(value: RangeValueInteger): () => {} {
    return async () => this.assessment =  await this.nhDelegate.createAssessment(value)
  }

  public async loadData(): Promise<void> {
    await super.loadData()
    this.loading = false
  }

  public logEvent = (e: Event) => {
    const targetItem = (e.target as HTMLElement).dataset.item
    const children = this.shadowRoot?.querySelectorAll('nh-icon')
    if (e.type === 'select-start') {
      children?.forEach((child: any) => {
        const match = (child as HTMLElement).dataset.item === targetItem
        if(!match) {
          (child as NHIconContainer).frozen = true;
        }
      })
    }
    if (e.type === 'select-cancel') {
      children?.forEach((child: any) => {
        const match = (child as HTMLElement).dataset.item === targetItem
        if(!match) {
          (child as NHIconContainer).frozen = false;
        }
      })
    }
  }

  renderIcons() {
    return this.icons.map((icon, value) => {
      const intValue = this.assessment?.value as RangeValueInteger
      return html`<nh-icon
          data-item=${value}
          .selected=${intValue && intValue.Integer == value}
          .frozen=${intValue && intValue.Integer == value}
          @select=${this.assessor({ Integer: value })}
          @select-start=${this.logEvent}
          @select-cancel=${this.logEvent}
        >${icon}</nh-icon>`
      }
    )
  }

  render() {
    if (this.loading) {
      return html`<span>l o a d i n g</span>`
    }
    return html`
      <div class="heat-scale">
        ${this.renderIcons()}
      </div>
    `;
  }

  static get elementDefinitions() {
    return {
      'nh-icon': NHIconContainer
    };
  }

  static get styles() {
    return [
      variables,
      css`
        :host {
            line-height: 32px;
        }
        .heat-scale {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
        }
      `,
    ];
  }
}
