import { css, html } from 'lit';
import { state } from 'lit/decorators.js';
import { Checkbox } from '@scoped-elements/material-web'
import {
  Assessment,
  InputAssessmentControl
} from '@neighbourhoods/client';
import { variables } from '../../../styles/variables';

export class ImportanceDimensionAssessment extends InputAssessmentControl {

  @state()
  loading: boolean = true

  @state()
  assessed: boolean = false

  createAssessment = async () => {
    if (!this.assessed) {
      this.assessment = await this.nhDelegate.createAssessment({ Integer: 1 })
      this.assessed = true
    }
  }

  render() {
    if (this.loading) {
      return html`<span>loading<span>`
    }
    return html`
      <div class="importance-toggle">
      <label class="star-checkbox">
        <input type="checkbox"
          name="myCheckbox"
          value="important"
          ?checked=${this.assessed}
          ?disabled=${this.assessed}
          @click=${this.createAssessment}
          >
        <span class="star"></span>
      </label>
      </div>`
  }

  static get scopedElements() {
    return {
      'mwc-checkbox': Checkbox,
    }
  }
  static get styles() {
    return [
      variables,
      css`
      .importance-toggle {
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
      .star-checkbox {
          display: flex;
          padding-left: 10px;
          padding-right: 10px;
        }

        .star-checkbox input[type="checkbox"] {
          display: none;
        }

        .star-checkbox .star {
          display: inline-block;
          width: 20px;
          height: 20px;
          background-color: #ccc;
          clip-path: polygon(
            50% 0%,
            63% 38%,
            100% 38%,
            69% 59%,
            82% 100%,
            50% 75%,
            18% 100%,
            31% 59%,
            0% 38%,
            37% 38%
          );
        }

        .star-checkbox input[type="checkbox"]:checked + .star {
          background-color: #ffdd00; /* Replace with your desired color */
        }
    `]
  }
}
