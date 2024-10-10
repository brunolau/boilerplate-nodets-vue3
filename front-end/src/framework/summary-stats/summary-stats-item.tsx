import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { CurrencyUtils } from "../../common/utils/currency-utils";
import { NamePreserver } from "../../common/name-preserver";
interface SummaryStatsItemArgs {
    icon?: string;
    imageUrl?: string;
    iconLayout?: IconLayout;
    value: number;
    valueCurrency?: Currency;
    subtext: string;
}

export const enum IconLayout {
    Primary = "icon-primary",
    Info = "icon-info",
    Success = "icon-success",
    Warning = "icon-warning",
    Danger = "icon-danger",
    White = "icon-white",
}

@Component
@NamePreserver("SummaryStatsItem")
class SummaryStatsItem extends TsxComponent<SummaryStatsItemArgs> implements SummaryStatsItemArgs {
    @Prop() icon!: string;
    @Prop() imageUrl!: string;
    @Prop() iconLayout!: IconLayout;
    @Prop() value!: number;
    @Prop() valueCurrency!: Currency;
    @Prop() subtext!: string;

    getCurrencyValue(): string {
        return CurrencyUtils.floatToCurrency(this.value, this.valueCurrency);
    }

    render(h) {
        return (
            <div class="summary-stat-item-root">
                <div class="statistics">
                    <div class="info">
                        <div class={"icon " + (this.iconLayout || "no-summary-icon")}>
                            {this.icon && <i class={this.icon}></i>}

                            {this.imageUrl && <div class="stats-icon-image" style={"background-image:url('" + this.imageUrl + "')"}></div>}
                        </div>
                        <h3 class="info-title">
                            {this.valueCurrency && <span>{this.getCurrencyValue()}</span>}

                            {!this.valueCurrency && <span>{this.value.toString()}</span>}
                        </h3>
                        <h6 class="stats-title">{this.subtext}</h6>
                    </div>
                </div>
            </div>
        );
    }
}

export default toNative(SummaryStatsItem);
