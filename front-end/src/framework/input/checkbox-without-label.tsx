import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import FormItemWrapper, { FormItemWrapperArgs, MarginType } from "../form/form-item-wrapper";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";
import CheckBox, { CheckBoxSkin } from "./checkbox";
import "./css/checkbox-without-label.css";

interface CheckBoxArgs extends FormItemWrapperArgs {
    value: boolean;
    checkboxLabelHtml?: string;
    placeholder?: string;
    skin?: CheckBoxSkin;
    changed?: (newValue: boolean) => void;
}

@Component
class CheckBoxWithoutLabel extends TsxComponent<CheckBoxArgs> implements CheckBoxArgs {
    @Prop() label!: string;
    @Prop() cssClass!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() subtitle!: string;
    @Prop() checkboxLabelHtml!: string;
    @Prop() value!: boolean;
    @Prop() placeholder!: string;
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

    render(h) {
        return (
            <div class="cb-without-label">
                <CheckBox
                    label={""}
                    cssClass={this.cssClass}
                    mandatory={this.mandatory}
                    wrap={true}
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
                    value={this.value}
                    changed={this.changed}
                    checkboxLabelHtml={this.checkboxLabelHtml}
                    skin={this.skin}
                />
            </div>
        );
    }
}

export default toNative(CheckBoxWithoutLabel);
