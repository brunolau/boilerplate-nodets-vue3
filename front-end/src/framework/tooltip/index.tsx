import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { Tooltip } from "bootstrap";
interface TooltipContainerArgs {
    renderAsSpan?: boolean;
    cssClass?: string;
    tooltipCssClass?: string;
    tooltip: string;
    isHtml?: boolean;
    textAlign?: "left" | "middle" | "right";
    arrowPosition?: "left" | "middle" | "right";
}

let counter = 0;

@Component
class TooltipContainer extends TsxComponent<TooltipContainerArgs> implements TooltipContainerArgs {
    @Prop() renderAsSpan!: boolean;
    @Prop() cssClass!: string;
    @Prop() tooltipCssClass?: string;
    @Prop() tooltip: string;
    @Prop() isHtml?: boolean;
    @Prop() textAlign?: "left" | "middle" | "right";
    @Prop() arrowPosition: "left" | "middle" | "right";
    uuid: string = null;

    mounted() {
        if (this.uuid == null) {
            this.uuid = portalUtils.randomString(8) + "-" + counter++;
        }

        this.$nextTick(() => {
            this.ensureTooltip();
        });
    }

    updated() {
        this.$nextTick(() => {
            $(this.$el).attr("data-original-title", this.tooltip);
            $(this.$el).attr("data-bs-original-title", this.tooltip);
        });
    }

    getInnerStyleAttribute(): string {
        if (!isNullOrEmpty(this.textAlign)) {
            return 'style="text:align: ' + this.textAlign + ' !important;"';
        }

        return "";
    }

    ensureTooltip() {
        this.$nextTick(() => {
            let target = $(this.$el);
            if (!target.hasClass("tooltip-bound")) {
                target.addClass("tooltip-bound");
                new Tooltip(this.$el, {
                    html: this.isHtml == true,
                    template: `<div class="tooltip ${this.arrowPosition != null ? "tt-" + this.arrowPosition + "-arrow" : ""} ${this.tooltipCssClass || ""}" role="tooltip"><div id="tt-uuid-${
                        this.uuid
                    }" class="arrow"></div><div class="tooltip-inner" ${this.getInnerStyleAttribute()}></div></div>`,
                });
            }
        });
    }

    getCssClass(): string {
        return "tooltip-container " + (this.cssClass || "");
    }

    beforeDestroy() {
        let visibleTooltip = document.getElementById(`tt-uuid-${this.uuid}`);
        if (visibleTooltip != null) {
            $(visibleTooltip).parent().remove();
        }
    }

    render(h) {
        if (this.renderAsSpan != true) {
            return (
                <div class={this.getCssClass()} title={this.tooltip}>
                    {this.$slots.default?.()}
                </div>
            );
        }

        return (
            <span class={this.getCssClass()} title={this.tooltip}>
                {this.$slots.default?.()}
            </span>
        );
    }
}

export default toNative(TooltipContainer);
