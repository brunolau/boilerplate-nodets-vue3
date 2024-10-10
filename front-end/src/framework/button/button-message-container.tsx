import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import "./css/button-message-container.css";

interface ButtonMessageContainerArgs {
    cssClass?: string;
    message: string;
}

@Component
class ButtonMessageContainer extends TsxComponent<ButtonMessageContainerArgs> implements ButtonMessageContainerArgs {
    @Prop() cssClass!: string;
    @Prop() message!: string;

    render(h) {
        return (
            <div class={"bmc-container-wrap form-control" + (!isNullOrEmpty(this.cssClass) ? " " + this.cssClass : "")}>
                <div class="bmc-container-inner">
                    <div class="bmc-container-message">{this.message}</div>
                    {this.$slots.default?.()}
                </div>
            </div>
        );
    }
}

export default toNative(ButtonMessageContainer);
