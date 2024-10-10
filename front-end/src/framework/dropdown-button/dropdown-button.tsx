import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { _ButtonArgsBase, ButtonLayout, ButtonSize } from "../button/button-layout";
import "./css/dropdown-button.css";
export interface DropdownButtonArgs extends _ButtonArgsBase {
    menuOnRight?: boolean;
    rootCssClass?: string;
    displayInline?: boolean;
    menuOnTop?: boolean;
}

@Component
class DropdownButton extends TsxComponent<DropdownButtonArgs> implements DropdownButtonArgs {
    @Prop() cssClass!: string;
    @Prop() rootCssClass!: string;
    @Prop() layout!: ButtonLayout;
    @Prop() text!: string;
    @Prop() tooltip!: string;
    @Prop() size!: ButtonSize;
    @Prop() round!: boolean;
    @Prop() outlined!: boolean;
    @Prop() dismissModal!: boolean;
    @Prop() icon!: string;
    @Prop() iconButton!: boolean;
    @Prop() iconOnRight!: boolean;
    @Prop() disabled!: boolean;
    @Prop() fullWidth!: boolean;
    @Prop() menuOnRight!: boolean;
    @Prop() displayInline?: boolean;
    @Prop() menuOnTop?: boolean;

    //When update, update Button & DropdownButton :/
    getCssClass(): string {
        return (
            "dropdown-toggle " +
            (this.layout || "btn btn-primary") +
            (this.size != null ? " " + this.size : "") +
            (this.outlined ? " btn-simple" : "") +
            (this.round ? " btn-round" : "") +
            (this.iconButton ? " btn-icon" : "") +
            (this.cssClass != null ? " " + this.cssClass : "") +
            (this.fullWidth ? " full-width" : "")
        );
    }

    render(h) {
        return (
            <div
                class={
                    "dropdown" +
                    (!isNullOrEmpty(this.rootCssClass) ? " " + this.rootCssClass : "") +
                    (this.displayInline == true ? " dropdown-inline-disp" : "") +
                    (this.menuOnTop == true ? " dropdown-menuontop" : "")
                }
            >
                <button
                    class={this.getCssClass()}
                    disabled={this.disabled == true}
                    type="button"
                    data-toggle="dropdown"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                    title={this.tooltip}
                >
                    {!isNullOrEmpty(this.icon) && <i class={this.icon}></i>}

                    {this.text}
                </button>
                <div class={"dropdown-menu" + (this.menuOnRight == true ? " dropdown-menu-right" : "")}>{this.$slots.default?.()}</div>
            </div>
        );
    }
}

export default toNative(DropdownButton);
