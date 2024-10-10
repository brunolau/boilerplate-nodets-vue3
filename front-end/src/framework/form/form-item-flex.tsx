import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";

interface FlexFormItemArgs {
    cssClass?: string;
    width?: number;
    flexFill?: boolean;
}

@Component
class FlexFormItem extends TsxComponent<FlexFormItemArgs> implements FlexFormItemArgs {
    @Prop() cssClass!: string;
    @Prop() width!: number;
    @Prop() flexFill!: boolean;

    getFlexFillCssClass(): string {
        return this.flexFill != false ? " frm-flex-childfill" : " frm-flex-childnofill";
    }

    getCustomCssClass(): string {
        return !isNullOrEmpty(this.cssClass) ? " " + this.cssClass : "";
    }

    getWidthStyleLiteral(): string {
        return this.width != null ? "width:" + this.width + "px;" : "";
    }

    render(h) {
        return (
            <div class={"frm-flex-child" + this.getFlexFillCssClass() + this.getCustomCssClass()} style={this.getWidthStyleLiteral()}>
                {this.$slots.default?.()}
            </div>
        );
    }
}

export default toNative(FlexFormItem);
