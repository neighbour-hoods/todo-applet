import { css, html } from 'lit';
import { property, queryAll, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { EntryHash } from '@holochain/client';
import {
  InputAssessmentControl, RangeValueInteger,
} from '@neighbourhoods/client';
import { variables } from '../../../styles/variables';
import { NHIconContainer } from '@neighbourhoods/design-system-components';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';

export class HeatDimensionAssessment extends ScopedRegistryHost(InputAssessmentControl) {

  @property()
  methodEh!: EntryHash;

  @state()
  loading = true;

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

  public logEvent = (e: Event)=>{
    console.log(e)
    this.childNodes.forEach((elem) => console.log(elem))
  }

  renderIcons() {
    return this.icons.map((icon, value) => {
      const intValue = this.assessment?.value as RangeValueInteger
      return html`<nh-icon
          data-value=${value}
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
        .heat-scale {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
        }
      `,
    ];
  }
}
