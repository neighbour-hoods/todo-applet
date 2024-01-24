import { css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { EntryHash } from '@holochain/client';
import {
  InputAssessmentControl, RangeValue,
} from '@neighbourhoods/client';
import { variables } from '../../../styles/variables';

export class HeatDimensionAssessment extends InputAssessmentControl {

  @property()
  methodEh!: EntryHash;

  @state()
  loading = true;

  async assess(value: RangeValue) {
    this.assessment =  await this.nhDelegate.createAssessment(value)
  }

  public async loadData(): Promise<void> {
    await super.loadData()
    this.loading = false
  }

  render() {
    if (this.loading) {
      return html`<span>l o a d i n g</span>`
    }
    return html`
      <div class="heat-scale">
        <span
          class="emoji-option"
          @click=${() => this.assess({ Integer: 0 })}
          >🧊</span
        >
        <span
          class="emoji-option"
          @click=${() => this.assess({ Integer: 1 })}
          >❄️</span
        >
        <span
          class="emoji-option"
          @click=${() => this.assess({ Integer: 2 })}
          >💧</span
        >
        <span
          class="emoji-option"
          @click=${() => this.assess({ Integer: 3 })}
          >🌶️</span
        >
        <span
          class="emoji-option"
          @click=${() => this.assess({ Integer: 4 })}
          >🔥</span
        >
      </div>
    `;
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
      `,
    ];
  }
}
