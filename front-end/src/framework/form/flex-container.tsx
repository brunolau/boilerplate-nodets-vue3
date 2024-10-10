import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";

interface FlexContainerArgs {
    cssClass?: string;
    fullWidthOnMobile?: boolean;
}

@Component
class FlexContainer extends TsxComponent<FlexContainerArgs> implements FlexContainerArgs {
    @Prop() cssClass!: string;
    @Prop() fullWidthOnMobile!: boolean;

    getCustomCssClass(): string {
        return !isNullOrEmpty(this.cssClass) ? " " + this.cssClass : "";
    }

    getFullWidthClass(): string {
        return this.fullWidthOnMobile != false ? " frm-flex-mobilefw" : "";
    }

    render(h) {
        return <div class={"frm-flex-container frm-item-flex" + this.getCustomCssClass() + this.getFullWidthClass()}>{this.$slots.default?.()}</div>;
    }
}

export default toNative(FlexContainer);
