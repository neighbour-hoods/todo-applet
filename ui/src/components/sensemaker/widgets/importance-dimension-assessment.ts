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
  loading: boolean = false

  @state()
  assessed: boolean = false

  public loadData = async () => {
    console.log('this.subscriber :>> ', this.assessment, this.nhDelegate);
  }

  createAssessment = async () => {
    if (!this.assessed) {
      this.assessment = await this.nhDelegate.createAssessment({ Integer: 1 })
      this.assessed = true
    }
  }

  render() {
    if (this.loading) {
      return html`<sl-spinner class="icon-spinner"></sl-spinner>`
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

  static get styles() {
    return [
      variables,
      css`
      .importance-toggle {
        display: grid;
        box-sizing: border-box;
        width: 48px;
        height: 48px;
        place-content: center;
      }

      .importance-toggle:hover .star {
        background-color: var(--nh-theme-warning-default); 
      }

      .star-checkbox {
        display: grid;
        place-content: center;
      }

      .star-checkbox input[type="checkbox"] {
        display: none;
      }

      .star-checkbox .star {
        display: inline-block;
        width: 24px;
        height: 24px;
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

      .icon-spinner {
        font-size: 2.15rem;
        --speed: 10000ms;
        --track-width: 4px;
        --indicator-color: var(--nh-theme-bg-muted);
        margin: 3px
      }
    `]
  }
}
