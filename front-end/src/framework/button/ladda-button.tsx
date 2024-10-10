import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { _ButtonArgsBase, ButtonLayout, ButtonSize } from "./button-layout";
import Button from "./button";

interface LaddaButtonArgs extends _ButtonArgsBase {
    clicked: (e: any) => Promise<any>;
}

@Component
class LaddaButton extends TsxComponent<LaddaButtonArgs> implements LaddaButtonArgs {
    @Prop() cssClass!: string;
    @Prop() layout!: ButtonLayout;
    @Prop() text!: string;
    @Prop() tooltip!: string;
    @Prop() size!: ButtonSize;
    @Prop() round!: boolean;
    @Prop() outlined!: boolean;
    @Prop() icon!: string;
    @Prop() iconOnRight!: boolean;
    @Prop() disabled!: boolean;
    @Prop() pulsate!: boolean;
    @Prop() clicked: (e: any) => Promise<any>;

    onButtonClicked(e) {
        var targetElem = e.target as HTMLElement;
        if (targetElem.nodeName.toLowerCase() != "button") {
            targetElem = $(targetElem).closest("button")[0];
        }
        LaddaLiteProvider.showSpin(targetElem);

        this.clicked(e)
            .then(function () {
                LaddaLiteProvider.hideSpin(targetElem);
            })
            .catch(function (error) {
                LaddaLiteProvider.hideSpin(targetElem);
            });
    }

    render(h) {
        return (
            <Button
                clicked={(e) => {
                    this.onButtonClicked(e);
                }}
                cssClass={this.cssClass}
                layout={this.layout}
                text={this.text}
                size={this.size}
                round={this.round}
                outlined={this.outlined}
                icon={this.icon}
                iconOnRight={this.iconOnRight}
                tooltip={this.tooltip}
                disabled={this.disabled}
                pulsate={this.pulsate}
            />
        );
    }
}

export default toNative(LaddaButton);
