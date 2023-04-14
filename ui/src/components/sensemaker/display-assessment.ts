import { contextProvided } from '@lit-labs/context';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { LitElement, html } from 'lit';
import { sensemakerStoreContext } from '../../contexts';
import { property, state } from 'lit/decorators.js';
import { RangeValueInteger, SensemakerStore, getLargestAssessment, getLatestAssessment } from '@neighbourhoods/client';
import { EntryHash, encodeHashToBase64 } from '@holochain/client';
import { StoreSubscriber } from 'lit-svelte-stores';
import { get } from "svelte/store";
export class DisplayAssessment extends ScopedElementsMixin(LitElement) {
    // context provided sensemaker store
    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @state()
    sensemakerStore!: SensemakerStore

    @property()
    resourceEh!: EntryHash

    @property()
    dimensionEh!: EntryHash
    
    // TODO: could probably change the .resourceAssessents to take in a resource hash and a dimension hash
    listTasksAssessments = new StoreSubscriber(this, () => this.sensemakerStore.resourceAssessments());

    // 🔥🧊❄️💧🌶️
    render() {
        const resourceAssessments = this.listTasksAssessments?.value[encodeHashToBase64(this.resourceEh)]
        const latestAssessment = resourceAssessments ? getLatestAssessment(resourceAssessments, encodeHashToBase64(this.dimensionEh)) : null;
        const latestAssessmentValue = latestAssessment ? (latestAssessment.value as RangeValueInteger).Integer : 0;
        
        switch (this.dimensionEh) {
            case get(this.sensemakerStore.appletConfig()).dimensions["total_importance"]: {
                return html`
                    <div>
                        (${latestAssessmentValue})
                    </div>
                `
            }
            case get(this.sensemakerStore.appletConfig()).dimensions["average_heat"]: {
                let emoji = "🧊";
                if (latestAssessmentValue > 7) {
                    emoji = "🔥";
                }
                else if (latestAssessmentValue > 5) {
                    emoji = "🌶️";
                }
                else if (latestAssessmentValue > 3) {
                    emoji = "💧";
                }
                else if (latestAssessmentValue > 1) {
                    emoji = "❄️";
                }
                else {
                    emoji = "🧊";
                }
                return html`
                    <div>
                        (${emoji})
                    </div>
                `
            }
        }
    }
}
