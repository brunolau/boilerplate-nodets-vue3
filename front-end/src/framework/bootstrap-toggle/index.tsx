import { Prop, toNative, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import "bootstrap4-toggle";
import "../../../node_modules/bootstrap4-toggle/css/bootstrap4-toggle.css";
import "./css/bootstrap-toggle.css";
import FormItemWrapper, { FormItemWrapperArgs, MarginType } from "../form/form-item-wrapper";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";
import { Validation } from "@vuelidate/core";

interface BootstrapToggleArgs extends FormItemWrapperArgs {
    value: boolean;
    enabled?: boolean;
    captionTrue?: string;
    captionFalse?: string;
    size?: BootstrapToggleSize;
    cssClassRoot?: string;
    changed: (newValue: boolean) => void;
    validationProperty?: Validation & any;
}

export const enum BootstrapToggleSize {
    Large = "large",
    Normal = "normal",
    Small = "small",
    Mini = "mini",
}

@Component
class BootstrapToggle extends TsxComponent<BootstrapToggleArgs> implements BootstrapToggleArgs {
    @Prop() label!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() subtitle!: string;
    @Prop() value!: boolean;
    @Prop() wrap!: boolean;
    @Prop() mandatory!: boolean;
    @Prop() hint: string;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() cssClass!: string;
    @Prop() cssClassRoot!: string;
    @Prop() maxWidth?: number;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    @Prop() changed: (newValue: boolean) => void;
    @Prop() enabled!: boolean;
    @Prop() captionTrue!: string;
    @Prop() captionFalse!: string;
    @Prop() marginType?: MarginType;
    @Prop() size!: BootstrapToggleSize;
    updating: boolean = false;
    currentValue: boolean = this.value;

    raiseChangeEvent(newValue: boolean) {
        this.populateValidationDeclaration();

        if (this.changed != null) {
            this.currentValue = newValue;
            this.changed(newValue);
        }
    }

    getBootstrapToggleElement(): HTMLElement {
        return this.$el.querySelector("input");
    }

    mounted() {
        this.currentValue = this.value;
        if (this.currentValue) {
            this.getBootstrapToggleElement()["checked"] = true;
        } else {
            this.getBootstrapToggleElement()["checked"] = false;
        }

        $(this.getBootstrapToggleElement())["bootstrapToggle"]({
            on: this.getCaptionTrue(),
            off: this.getCaptionFalse(),
            size: this.size || BootstrapToggleSize.Normal,
            onstyle: AppConfig.onBootstrapStyle,
        });

        if (this.enabled == false) {
            $(this.getBootstrapToggleElement())["bootstrapToggle"]("disable");
        }

        $(this.getBootstrapToggleElement()).change(() => {
            this.updating = true;
            this.raiseChangeEvent(this.getBootstrapToggleElement()["checked"]);
            this.$nextTick(() => (this.updating = false));
        });
    }

    @Watch("value")
    updateValue() {
        this.currentValue = this.value;
    }

    getCaptionTrue(): string {
        return this.captionTrue || AppState.resources.yes;
    }

    getCaptionFalse(): string {
        return this.captionFalse || AppState.resources.no;
    }

    getMinWidthCssClass(): string {
        if (this.getCaptionFalse().length > 5 || this.getCaptionTrue().length > 5) {
            return "toggle-min-100";
        }

        return "";
    }

    beforeUpdate(): void {
        if (this.currentValue != this.getBootstrapToggleElement()["checked"]) {
            this.$el.querySelector(".toggle-group").classList.add("no-toggle-trans");
            this.getBootstrapToggleElement()["checked"] = this.currentValue;
            $(this.getBootstrapToggleElement())["bootstrapToggle"](this.currentValue ? "on" : "off");

            this.$nextTick(() => {
                setTimeout(() => {
                    this.$el.querySelector(".toggle-group").classList.remove("no-toggle-trans");
                }, 150);
            });
        }

        var onCaption = this.getCaptionTrue();
        var onLabel = this.$el.querySelector(".toggle-on");

        var offCaption = this.getCaptionFalse();
        var offLabel = this.$el.querySelector(".toggle-off");

        if (onLabel.innerHTML != onCaption) {
            onLabel.innerHTML = onCaption;
        }

        if (offLabel.innerHTML != offCaption) {
            offLabel.innerHTML = offCaption;
        }
    }

    beforeDestroy() {
        $(this.getBootstrapToggleElement())["bootstrapToggle"]("destroy");
        $(this.getBootstrapToggleElement()).off("change");
    }

    render(h) {
        return (
            <div class={this.getMinWidthCssClass() + (!isNullOrEmpty(this.cssClassRoot) ? " " + this.cssClassRoot : "")}>
                <FormItemWrapper
                    label={this.label}
                    mandatory={this.mandatory}
                    wrap={this.wrap}
                    cssClass={this.cssClass}
                    appendIcon={this.appendIcon}
                    prependIcon={this.prependIcon}
                    hint={this.hint}
                    appendClicked={this.appendClicked}
                    prependClicked={this.prependClicked}
                    marginType={this.marginType}
                    maxWidth={this.maxWidth}
                    validationState={this.validationState}
                    labelButtons={this.labelButtons}
                    subtitle={this.subtitle}
                >
                    <input type="checkbox" data-dummy={this.currentValue} />
                </FormItemWrapper>
            </div>
        );
    }
}

export default toNative(BootstrapToggle);
