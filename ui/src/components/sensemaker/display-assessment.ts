import { contextProvided } from '@lit-labs/context';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { LitElement, html } from 'lit';
import { sensemakerStoreContext } from '../../contexts';
import { property, state } from 'lit/decorators.js';
import { RangeValueInteger, SensemakerStore, getLargestAssessment } from '@neighbourhoods/client';
import { EntryHash, encodeHashToBase64 } from '@holochain/client';
import { StoreSubscriber } from 'lit-svelte-stores';
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

    render() {
        const resourceAssessments = this.listTasksAssessments?.value[encodeHashToBase64(this.resourceEh)]
        const largestAssessment = resourceAssessments ? getLargestAssessment(resourceAssessments, encodeHashToBase64(this.dimensionEh)) : null;
        const taskImportance = largestAssessment ? (largestAssessment.value as RangeValueInteger).Integer : 0;
        return html`
            <div>
                ${taskImportance}
            </div>
        `
    }
}
