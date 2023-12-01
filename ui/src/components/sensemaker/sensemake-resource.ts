import { contextProvided } from "@lit-labs/context";
import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css, unsafeCSS } from "lit";
import { sensemakerStoreContext, SensemakerStore, getLatestAssessment } from "@neighbourhoods/client";
import { EntryHash, encodeHashToBase64, decodeHashFromBase64 } from "@holochain/client";
import { StoreSubscriber } from "lit-svelte-stores";
import { get } from "svelte/store";
import { inputWidgetDelegate, outputWidgetDelegate } from "../../utils";
import { HeatDimensionAssessment } from "./widgets/heat-dimension-assessment";
import { AverageHeatDimensionDisplay } from "./widgets/average-heat-dimension-display";
import { InputAssessmentWidgetDelegate, NHDelegateReceiver, NHDelegateReceiverComponent, OutputAssessmentWidgetDelegate } from "@neighbourhoods/nh-launcher-applet";

export class SensemakeResource extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @state()
    public  sensemakerStore!: SensemakerStore

    @property()
    resourceEh!: EntryHash

    @property()
    resourceDefEh!: EntryHash

    @property()
    inputDimensionEh!: EntryHash

    @property()
    outputDimensionEh!: EntryHash

    inputWidget: NHDelegateReceiver<InputAssessmentWidgetDelegate> & LitElement | null = null;
    outputWidget: NHDelegateReceiver<OutputAssessmentWidgetDelegate> & LitElement | null = null;

    resourceAssessments = new StoreSubscriber(this, () => this.sensemakerStore.resourceAssessments());
    activeMethod = new StoreSubscriber(this, () => this.sensemakerStore.activeMethod());

    async firstUpdated() {
        let inputWidgetDelegateInstance = inputWidgetDelegate(this.sensemakerStore);
        let outputWidgetDelegateInstance = outputWidgetDelegate(this.sensemakerStore);

        let inputWidget = new HeatDimensionAssessment();
        inputWidget.resourceEh = this.resourceEh;
        inputWidget.resourceDefEh = this.resourceDefEh;
        inputWidget.dimensionEh = this.inputDimensionEh;
        inputWidget.nhDelegate = inputWidgetDelegateInstance;
        this.inputWidget = inputWidget;

        let outputWidget = new AverageHeatDimensionDisplay();
        outputWidget.resourceEh = this.resourceEh;
        outputWidget.dimensionEh = this.outputDimensionEh;
        outputWidget.nhDelegate = outputWidgetDelegateInstance;
        this.outputWidget = outputWidget;
    }

    render() {
        // const activeMethodEh = this.activeMethod.value[encodeHashToBase64(this.resourceDefEh)]
        // const { inputDimensionEh, outputDimensionEh } = get(this.sensemakerStore.methodDimensionMapping())[activeMethodEh];
        // const assessDimensionWidgetType = (get(this.sensemakerStore.widgetRegistry()))[encodeHashToBase64(inputDimensionEh)].assess
        // const displayDimensionWidgetType = (get(this.sensemakerStore.widgetRegistry()))[encodeHashToBase64(inputDimensionEh)].display
        // const assessDimensionWidget = new assessDimensionWidgetType();
        // const displayDimensionWidget = new displayDimensionWidgetType();
        // assessDimensionWidget.resourceEh = this.resourceEh;
        // assessDimensionWidget.resourceDefEh = this.resourceDefEh
        // assessDimensionWidget.dimensionEh = inputDimensionEh;
        // assessDimensionWidget.methodEh = decodeHashFromBase64(activeMethodEh);
        // assessDimensionWidget.sensemakerStore = this.sensemakerStore;

        // const latestAssessment = get(this.sensemakerStore.myLatestAssessmentAlongDimension(encodeHashToBase64(this.resourceEh), encodeHashToBase64(inputDimensionEh)))
        // assessDimensionWidget.latestAssessment = latestAssessment;

        // displayDimensionWidget.assessment = getLatestAssessment(
        //     this.resourceAssessments.value[encodeHashToBase64(this.resourceEh)] ? this.resourceAssessments.value[encodeHashToBase64(this.resourceEh)] : [], 
        //     encodeHashToBase64(outputDimensionEh)
        // );
        // const assessWidgetStyles = assessDimensionWidgetType.styles as any;
        // const displayWidgetStyles = displayDimensionWidgetType.styles as any;

        return html`
            <div class="sensemake-resource">
                ${
                    //@ts-ignore
                    this.outputWidget!.render()
                }
                <slot></slot>
                ${
                    //@ts-ignore
                    this.inputWidget!.render()
                }
            </div>
        `
    }
    static get styles() {
        return [
            css`
            .sensemake-resource {
                display: flex;
                flex-direction: row;
                width: 100%;
                height: 100%;
            }
            ::slotted(*) {
                flex: 1;
            }
        `]};
    static get scopedElements() {
        return {
        }
    }
}