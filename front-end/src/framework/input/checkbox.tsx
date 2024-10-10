import { toNative, Prop, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import FormItemWrapper, { FormItemWrapperArgs, MarginType } from "../form/form-item-wrapper";
import HtmlLiteral from "../html-literal/html-literal";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";

interface CheckBoxArgs extends FormItemWrapperArgs {
    value: boolean;
    checkboxLabelHtml?: string;
    skin?: CheckBoxSkin;
    changed?: (newValue: boolean) => void;
}

export const enum CheckBoxSkin {
    NowUi = 0,
    Material = 1,
}

@Component
class CheckBox extends TsxComponent<CheckBoxArgs> implements CheckBoxArgs {
    @Prop() label!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() cssClass!: string;
    @Prop() subtitle!: string;
    @Prop() checkboxLabelHtml!: string;
    @Prop() value!: boolean;
    @Prop() mandatory!: boolean;
    @Prop() wrap!: boolean;
    @Prop() maxWidth?: number;
    @Prop() skin!: CheckBoxSkin;
    @Prop() marginType?: MarginType;
    @Prop() hint: string;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    @Prop() changed: (newValue: boolean) => void;
    uuid: string = null;
    currentValue: boolean = this.value;

    mounted() {
        this.currentValue = this.value;
    }

    @Watch("value")
    updateValue() {
        this.currentValue = this.value;
    }

    raiseChangeEvent(e) {
        this.populateValidationDeclaration();
        this.currentValue = e.target.checked;

        if (this.changed != null) {
            this.changed(this.currentValue);
        }
    }

    render(h) {
        return (
            <FormItemWrapper
                label={this.label}
                cssClass={this.cssClass}
                mandatory={this.mandatory}
                wrap={this.wrap}
                appendIcon={this.appendIcon}
                prependIcon={this.prependIcon}
                marginType={this.marginType}
                hint={this.hint}
                appendClicked={this.appendClicked}
                prependClicked={this.prependClicked}
                maxWidth={this.maxWidth}
                validationState={this.validationState}
                labelButtons={this.labelButtons}
                subtitle={this.subtitle}
            >
                {this.renderCheckboxBasedOnSkin(h)}
            </FormItemWrapper>
        );
    }

    renderCheckboxBasedOnSkin(h) {
        if (this.skin == CheckBoxSkin.NowUi) {
            return this.renderCheckboxNowUi(h);
        } else {
            return this.renderCheckboxMaterial(h);
        }
    }

    renderCheckboxNowUi(h) {
        return (
            <div class={"form-check " + (this.wrap ? "ui-checkbox-wrapped" : "ui-checkbox-nonwrapped")}>
                <label class="form-check-label">
                    <input class="form-check-input" type="checkbox" checked={this.currentValue} onChange={(e) => this.raiseChangeEvent(e)} />
                    <span class="form-check-sign"></span>
                    {this.checkboxLabelHtml}
                </label>
            </div>
        );
    }

    renderCheckboxMaterial(h) {
        if (this.uuid == null) {
            this.uuid = portalUtils.randomString(12);
        }

        return (
            <div class="inv-md-checkbox">
                <div class="inv-cbrb-inner">
                    <input class="inv-chckb-clickable" type="checkbox" id={"iei-input-" + this.uuid} checked={this.currentValue} onChange={(e) => this.raiseChangeEvent(e)} />
                    <label class="inv-chckb-clickable form-check-label " for={"iei-input-" + this.uuid}>
                        <HtmlLiteral innerHTML={this.checkboxLabelHtml} />
                    </label>
                </div>
            </div>
        );
    }
}

export default toNative(CheckBox);
