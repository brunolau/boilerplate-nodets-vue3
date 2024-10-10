import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import "./css/fieldset.css";

interface FieldsetArgs {
    caption: string;
    cssClass?: string;
    equalHeight?: boolean;
    validationState?: ValidationState;
    bottomMargin?: boolean;
    customValidationMessage?: ((item) => string) | string;
    isCollapsedByDefault?: boolean;
}

@Component
class Fieldset extends TsxComponent<FieldsetArgs> implements FieldsetArgs {
    @Prop() caption!: string;
    @Prop() cssClass!: string;
    @Prop() equalHeight!: boolean;
    @Prop() bottomMargin?: boolean;
    @Prop() customValidationMessage: (() => string) | string;
    @Prop() isCollapsedByDefault: boolean;
    isCollapsed: boolean = false;
    slotsMaxHeight = 10000;

    getErrorCssClass(): string {
        return this.hasValidationError ? " has-danger" : "";
    }

    getCustomCssClass(): string {
        return !isNullOrEmpty(this.cssClass) ? " " + this.cssClass : "";
    }

    getEqualHeightCssClass(): string {
        return this.equalHeight == true ? " fieldset-equal-height" : "";
    }

    getNoBottomMarginCssClass(): string {
        return this.bottomMargin == false ? " fieldset-no-bottom-margin" : "";
    }

    getValidationErrorMessage(): string {
        if (this.customValidationMessage != null) {
            if (this.customValidationMessage.length && this.customValidationMessage.length == 0) {
                return this.validationErrorMessage;
            } else {
                return (this.customValidationMessage as any)(this);
            }
        }

        return this.validationErrorMessage;
    }

    mounted() {
        this.isCollapsed = this.isCollapsedByDefault === true;
    }

    render(h) {
        return (
            <div class={"fieldset-control" + this.getErrorCssClass() + this.getCustomCssClass() + this.getEqualHeightCssClass() + this.getNoBottomMarginCssClass()}>
                <div
                    class="fieldset-legend"
                    onClick={() => {
                        this.isCollapsed = !this.isCollapsed;
                    }}
                >
                    {this.caption} <div class={`fieldset-legend-arrow ${this.isCollapsed ? "fieldset-legend-arrow-collapsed" : ""}`}>►</div>
                </div>
                <div class={`fieldset-slots ${this.isCollapsed ? "fieldset-slots-collapsed" : ""}`}>{this.$slots.default?.()}</div>

                {this.hasValidationError && <div class="invalid-feedback">{this.getValidationErrorMessage()}</div>}

                <div style="clear:both;"></div>
            </div>
        );
    }
}

export default toNative(Fieldset);
