import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import "./css/progress-bar.css";

export const enum ProgressBarTextPlacement {
    Above = 0,
    Below = 1,
}

interface ProgressBarArgs {
    maxCount: number;
    currentCount: number;
    fullWidth?: boolean;
    cssClass?: string;
    textPlacement?: ProgressBarTextPlacement;
}

@Component
class ProgressBar extends TsxComponent<ProgressBarArgs> implements ProgressBarArgs {
    @Prop() maxCount!: number;
    @Prop() currentCount!: number;
    @Prop() fullWidth!: boolean;
    @Prop() cssClass: string;
    @Prop() textPlacement!: ProgressBarTextPlacement;

    getTextPlacementSuffix(): string {
        if (this.textPlacement == null || this.textPlacement == ProgressBarTextPlacement.Above) {
            return "above";
        } else {
            return "below";
        }
    }

    render(h) {
        let currentCount = this.currentCount || 0;
        let maxCount = this.maxCount || 0;
        let percentage = Math.round((currentCount * 100) / maxCount);

        return (
            <div
                class={"percentage-fm-wrap percentage-fm-text" + this.getTextPlacementSuffix() + (!isNullOrEmpty(this.cssClass) ? " " + this.cssClass : "")}
                style={this.fullWidth != true ? "" : "width:100%;"}
            >
                <div class="percentage-fm-text">{currentCount.toString() + " / " + maxCount.toString()}</div>
                <div class="percentage-fm-pbwrap">
                    <div class="percentage-fm-pbinner" style={"width:" + percentage + "%"}></div>
                </div>
            </div>
        );
    }
}

export default toNative(ProgressBar);
