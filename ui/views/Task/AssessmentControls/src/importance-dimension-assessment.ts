import { html } from 'lit';
import { state } from 'lit/decorators.js';
import {
  InputAssessmentControl
} from '@neighbourhoods/client';
import { NHIconContainer, NHSpinner } from '@neighbourhoods/design-system-components';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';

export class ImportanceDimensionAssessment extends ScopedRegistryHost(InputAssessmentControl) {
  @state()
  loading: boolean = true

  @state()
  assessed: boolean = false

  public async loadData(this: ImportanceDimensionAssessment) {
    await super.loadData()
    this.loading = false
  }

  createAssessment = async () => {
    if (!this.assessed) {
      this.assessment = (await this.nhDelegate.createAssessment({ Integer: 1 }))!.entry
      this.assessed = true
    }
  }

  render() {
    if (this.loading) {
      return html`<mwc-progress indeterminate class="icon-spinner"></mwc-progress>`
    }
    return html`<nh-icon @select=${this.createAssessment}>⭐️<nh-icon>`
  }

  static get elementDefinitions() {
    return {
      'nh-icon': NHIconContainer,
      "nh-spinner": NHSpinner,
    };
  }
}
