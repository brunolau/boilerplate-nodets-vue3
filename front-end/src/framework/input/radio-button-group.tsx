import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import FormItemWrapper, { FormItemWrapperArgs, MarginType, HintType } from "../form/form-item-wrapper";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";
import "./css/radio-button-group.css";

type RowToString = (row) => string;
interface RadioButtonGroupArgs extends FormItemWrapperArgs {
    changed: (newValue: string | any) => void;
    options: Array<string> | Array<any>;
    displayMember?: string | RowToString;
    valueMember?: string | RowToString;
    selected: string | any;
}

interface RadioDisplayArgs {
    id: string;
    text: string;
    dataRow: any;
}

@Component
class RadioButtonGroup extends TsxComponent<RadioButtonGroupArgs> implements RadioButtonGroupArgs {
    @Prop() label!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() subtitle!: string;
    @Prop() mandatory!: boolean;
    @Prop() wrap!: boolean;
    @Prop() hint: string;
    @Prop() hintType!: HintType;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    @Prop() marginType?: MarginType;
    @Prop() maxWidth?: number;
    @Prop() options!: Array<string> | Array<any>;
    @Prop() displayMember!: (row) => string | string;
    @Prop() valueMember!: (row) => string | string;
    @Prop() selected!: string | any;
    @Prop() changed: (newValue: string | any) => void;

    raiseChangedEvent(newValue: RadioDisplayArgs) {
        if (newValue == this.selected) {
            return;
        }

        this.populateValidationDeclaration();
        this.selected = newValue;

        if (this.changed != null) {
            this.changed(newValue);
        }
    }

    getValueFromArr(paramArr: string[], row): string {
        for (var i = 0, len = paramArr.length; i < len; i++) {
            var val = row[paramArr[i]];
            if (val == null) {
                val = row[paramArr[i].capitalize()];
            }

            if (val != null) {
                if (portalUtils.isString(val) && val.length > 0) {
                    return val;
                } else if (portalUtils.isNumber(val)) {
                    return val.toString();
                } else if (portalUtils.isFunction(val)) {
                    return val.call(row, row);
                }
            }
        }

        return null;
    }

    getReflectedRowValue(row: any, isValueMember: boolean): string {
        var member = isValueMember ? this.valueMember : this.displayMember;
        if (member == null) {
            if (isValueMember) {
                return this.getValueFromArr(["id"], row);
            } else {
                return this.getValueFromArr(["name", "text", "identifier"], row);
            }
        } else if (portalUtils.isString(member)) {
            return row[member as any];
        } else if (portalUtils.isNumber(member)) {
            return row[member as any].toString();
        } else if (portalUtils.isFunction(member)) {
            return member.call(row, row);
        }
    }

    getOptions(): RadioDisplayArgs[] {
        var retVal: RadioDisplayArgs[] = [];
        var opts = this.options as any;

        if (opts != null && opts.length > 0) {
            var firstItem = opts[0];
            if (portalUtils.isString(firstItem)) {
                opts.forEach((item) => retVal.push({ id: item, text: item, dataRow: item }));
            } else if (portalUtils.isNumber(firstItem)) {
                opts.forEach((item) => retVal.push({ id: item.toString(), text: item.toString(), dataRow: item.toString() }));
            } else {
                opts.forEach((item) => {
                    retVal.push({
                        id: this.getReflectedRowValue(item, true),
                        text: this.getReflectedRowValue(item, false),
                        dataRow: item,
                    });
                });
            }
        }

        return retVal;
    }

    getSelectedItem(opts?: RadioDisplayArgs[]): RadioDisplayArgs {
        opts = opts || this.getOptions();

        if (this.selected == null || opts.length == 0) {
            return opts[0];
        }

        var selVal: string;
        var selectedItem = this.selected;
        if (portalUtils.isString(selectedItem) || portalUtils.isNumber(selectedItem)) {
            selVal = selectedItem.toString();
        } else {
            selVal = this.getReflectedRowValue(selectedItem, true);
        }

        for (var i = 0, len = opts.length; i < len; i++) {
            var ci = opts[i];
            if (ci.id == selVal) {
                return ci;
            }
        }

        return null;
    }

    render(h) {
        return (
            <FormItemWrapper
                label={this.label}
                mandatory={this.mandatory}
                wrap={this.wrap}
                appendIcon={this.appendIcon}
                prependIcon={this.prependIcon}
                hint={this.hint}
                hintType={this.hintType}
                appendClicked={this.appendClicked}
                prependClicked={this.prependClicked}
                marginType={this.marginType}
                maxWidth={this.maxWidth}
                validationState={this.validationState}
                labelButtons={this.labelButtons}
                subtitle={this.subtitle}
            >
                {this.renderInput(h)}
            </FormItemWrapper>
        );
    }

    onRadioValueChanged() {
        var selectedValue = this.$el.querySelector('input[type="radio"]:checked')["value"];
        if (selectedValue != null) {
            var opts = this.getOptions();
            for (var i = 0, len = opts.length; i < len; i++) {
                var optItem = opts[i];
                if (optItem.id == selectedValue) {
                    this.raiseChangedEvent(optItem.dataRow);
                    break;
                }
            }
        }
    }

    renderInput(h) {
        let nameId = "iei-group-" + portalUtils.randomString(6);
        let selectedItem = this.getSelectedItem();

        return (
            <div class="radio-group-wrap">
                {this.getOptions().map((optionItem) => {
                    const uuid = "iei-input-" + portalUtils.randomString(10);
                    const selected = optionItem.id == selectedItem.id;

                    return (
                        <div class="inv-rbchb form-check inv-mdfw-radio">
                            <div class="inv-cbrb-inner">
                                <input class="form-check-input" checked={selected} type="radio" name={nameId} id={uuid} value={optionItem.id} onChange={() => this.onRadioValueChanged()} />
                                <label class="form-check-label" for={uuid}>
                                    <span>{optionItem.text}</span>
                                </label>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default toNative(RadioButtonGroup);
