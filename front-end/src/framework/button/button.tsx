import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { _ButtonArgsBase, ButtonSize, ButtonLayout } from "./button-layout";
import { Tooltip } from "bootstrap";

interface ButtonArgs extends _ButtonArgsBase {
    clicked: (e: any) => void;
}

@Component
class Button extends TsxComponent<ButtonArgs> implements ButtonArgs {
    @Prop() cssClass!: string;
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
    @Prop() clicked: (e: any) => void;
    @Prop() disabled!: boolean;
    @Prop() fullWidth!: boolean;
    @Prop() pulsate!: boolean;

    //When update, update Button & DropdownButton :/
    getCssClass(): string {
        return (
            this.getParsedLayout() +
            (this.size != null ? " " + this.size : "") +
            (this.outlined ? " btn-simple" : "") +
            (this.round ? " btn-round" : "") +
            (this.iconButton ? " btn-icon" : "") +
            (this.cssClass != null ? " " + this.cssClass : "") +
            (this.fullWidth ? " full-width" : "") +
            (this.pulsate ? " btn-pulsating" : "")
        );
    }

    getParsedLayout() {
        if (!this.outlined) {
            return this.layout || "btn btn-primary";
        } else {
            return (this.layout || "btn btn-primary").replace("btn btn-", "btn btn-outline-");
        }
    }

    onButtonClicked(e) {
        this.clicked(e);

        if (!isNullOrEmpty(this.tooltip)) {
            $("body > .tooltip").first().remove();
        }

        $(this.$el).blur();
    }

    mounted() {
        if (!isNullOrEmpty(this.tooltip)) {
            new Tooltip(this.$el);
        }
    }

    render(h) {
        return (
            <button
                type="button"
                class={this.getCssClass()}
                disabled={this.disabled == true}
                data-dismiss={this.dismissModal ? "modal" : null}
                data-bs-dismiss={this.dismissModal ? "modal" : null}
                title={this.tooltip}
                onClick={(e) => {
                    this.onButtonClicked(e);
                }}
            >
                {this.icon && this.iconOnRight != true && (
                    <span class="btn-label">
                        <i class={this.icon}></i>
                        {this.text && <span>&nbsp;&nbsp;</span>}
                    </span>
                )}

                {this.text}

                {this.icon && this.iconOnRight == true && (
                    <span class="btn-label">
                        {this.text && <span>&nbsp;&nbsp;</span>}
                        <i class={this.icon}></i>
                    </span>
                )}
            </button>
        );
    }
}

export default toNative(Button);
