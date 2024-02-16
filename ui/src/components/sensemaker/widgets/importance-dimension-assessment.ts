import { css, html } from 'lit';
import { state } from 'lit/decorators.js';
import {
  InputAssessmentControl
} from '@neighbourhoods/client';
import { variables } from '../../../styles/variables';
import { NHIconContainer } from '@neighbourhoods/design-system-components';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';

export class ImportanceDimensionAssessment extends ScopedRegistryHost(InputAssessmentControl) {
  @state()
  loading: boolean = true

  @state()
  assessed: boolean = false

  public async loadData(this: ImportanceDimensionAssessment) {
    await super.loadData()
    this.loading = false
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
    return html`<nh-icon @select=${this.createAssessment}>⭐️<nh-icon>`
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
