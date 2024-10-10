import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import DropdownButtonItem, { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";

export const enum HintType {
    Default = 0,
    Label = 1,
}

export const enum MarginType {
    Standard = 0,
    None = 1,
    Small = 2,
}

export interface FormItemWrapperArgs {
    label: string;
    mandatory?: boolean;
    hint?: string;
    hintType?: HintType;
    marginType?: MarginType;
    subtitle?: string;
    labelButtons?: DropdownButtonItemArgs[];
    flex?: boolean;
    cssClass?: string;
    maxWidth?: number;
    validationState?: ValidationState;
    appendIcon?: string;
    prependIcon?: string;
    appendClicked?: () => void;
    prependClicked?: () => void;
    wrap?: boolean;
}

export class FormItemWrapperConfig {
    static labelColumnClass: string = "col-md-4";
    static contentColumnClass: string = "col-md-8";
}

@Component
class FormItemWrapper extends TsxComponent<FormItemWrapperArgs> implements FormItemWrapperArgs {
    @Prop() label: string;
    @Prop() labelButtons: DropdownButtonItemArgs[];
    @Prop() mandatory: boolean;
    @Prop() flex: boolean;
    @Prop() hint: string;
    @Prop() subtitle: string;
    @Prop() hintType: HintType;
    @Prop() marginType?: MarginType;
    @Prop() maxWidth?: number;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() cssClass: string;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    @Prop() wrap: boolean;
    tooltipBound: boolean = false;

    onAppendClicked() {
        if (this.appendClicked != null) {
            this.appendClicked();
        }
    }

    getFormGroupBaseClass(): string {
        let retVal: string = null;
        if (this.appendIcon == null && this.prependIcon == null && this.hint == null) {
            retVal = "form-group";
        } else {
            retVal = "input-group";
        }

        if (this.marginType != null) {
            retVal += " fiw-margintype-" + this.marginType;
        }

        return retVal;
    }

    getPropCssClass() {
        return !isNullOrEmpty(this.cssClass) ? this.cssClass + " " : "";
    }

    getFlexCssClass() {
        return this.flex != true ? "" : "frm-item-flex" + " ";
    }

    ensureTooltip() {
        if (!isNullOrEmpty(this.hint) && !this.tooltipBound) {
            this.$nextTick(() => {
                let target = $(this.$el).find(".input-group-append");
                if (this.hintType == HintType.Label) {
                    target = $(this.$el).find(".col-form-label i");
                }
                if (!target.hasClass("tooltip-bound")) {
                    target.addClass("tooltip-bound");
                    target.tooltip();
                }
            });
        }
    }

    render(h) {
        if (this.wrap != false) {
            let isHintLabel = this.hint && this.hintType == HintType.Label;
            this.ensureTooltip();

            return (
                <div class="row form-item-wrapper">
                    <label class={`${FormItemWrapperConfig.labelColumnClass} col-form-label`}>
                        {this.label}

                        {!isNullOrEmpty(this.labelButtons) &&
                            this.labelButtons.map((btn) => (
                                <span class="col-form-labelbuttons">
                                    <DropdownButtonItem
                                        text={btn.text}
                                        clicked={btn.clicked}
                                        disabled={btn.disabled}
                                        href={btn.href}
                                        hrefBlank={btn.hrefBlank}
                                        icon={btn.icon}
                                        img={btn.img}
                                        isSelected={btn.isSelected}
                                        emptySpace={false}
                                    />
                                </span>
                            ))}

                        {this.mandatory && <span class="is-required"></span>}

                        {isHintLabel && <i class="icon icon-info input-group-append ms-1" style="cursor: help;" title={this.hint}></i>}
                    </label>
                    <div class={`${FormItemWrapperConfig.contentColumnClass}`}>
                        {this.maxWidth == null ? this.renderInnerContent(h) : <div style={"max-width:" + this.maxWidth + "px;"}>{this.renderInnerContent(h)}</div>}
                    </div>
                </div>
            );
        } else {
            return <div class="formwrap-nomargin">{this.renderInnerContent(h)}</div>;
        }
    }

    renderInnerContent(h) {
        return (
            <div class={this.getFormGroupBaseClass() + " maxwidth-input " + this.getPropCssClass() + this.getFlexCssClass() + this.validationCssClass}>
                {this.$slots.default?.()}
                {this.hint && this.hintType != HintType.Label && (
                    <div
                        onClick={() => {
                            this.onAppendClicked();
                        }}
                        title={this.hint}
                        class="input-group-append"
                        style="cursor: help;"
                    >
                        <div class="input-group-text" style="">
                            <i class="now-ui-icons travel_info"></i>
                        </div>
                    </div>
                )}

                {this.appendIcon && (
                    <div class="input-group-text" style="">
                        <i class={this.appendIcon}></i>
                    </div>
                )}

                {!isNullOrEmpty(this.subtitle) && <small class="form-text text-muted col-form-subtitle">{this.subtitle}</small>}

                {this.hasValidationError && <div class="invalid-feedback">{this.validationErrorMessage}</div>}
            </div>
        );
    }
}

export default toNative(FormItemWrapper);
