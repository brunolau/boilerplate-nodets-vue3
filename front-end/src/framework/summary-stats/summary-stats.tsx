import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import SummaryStatsItem from "./summary-stats-item";
import "./css/summary-stats.css";
interface SummaryStatsArgs {}

@Component
class SummaryStats extends TsxComponent<SummaryStatsArgs> implements SummaryStatsArgs {
    getChildItems(): typeof SummaryStatsItem.prototype[] {
        return this.getSlotProperties("SummaryStatsItem");
    }

    render(h) {
        return <div class={"row card-stats " + ("summarystat-" + this.getChildItems().length + "-items")}>{this.$slots.default?.()}</div>;
    }
}

export default toNative(SummaryStats);
