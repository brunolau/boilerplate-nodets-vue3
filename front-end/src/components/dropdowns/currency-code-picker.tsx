import { Prop, toNative } from "vue-facing-decorator";
import { CURRENCY_CODE } from "../../api/data-contracts/enums";
import TsxComponent, { Component } from "../../app/vuetsx";
import DropdownList, { DropdownListOption } from "../../framework/dropdown";
import CurrencyCodeTranslator from "../../utils/enum-translation/currency-code-translator";

interface CurrencyCodePickerArgs {
    selected: CURRENCY_CODE;
    mandatory?: boolean;
    label?: string;
    placeholder?: string;
    validationState?: ValidationState;
    wrap?: boolean;
    changed: (e: CURRENCY_CODE) => void;
}

@Component
class CurrencyCodePicker extends TsxComponent<CurrencyCodePickerArgs> implements CurrencyCodePickerArgs {
    @Prop() selected: CURRENCY_CODE;
    @Prop() mandatory!: boolean;
    @Prop() label!: string;
    @Prop() placeholder!: string;
    @Prop() wrap!: boolean;
    @Prop() changed: (e: CURRENCY_CODE) => void;

    getOptionList(): DropdownListOption[] {
        return [
            { id: CURRENCY_CODE.EUR, text: CurrencyCodeTranslator.getString(CURRENCY_CODE.EUR) },
            { id: CURRENCY_CODE.CZK, text: CurrencyCodeTranslator.getString(CURRENCY_CODE.CZK) },
            { id: CURRENCY_CODE.GBP, text: CurrencyCodeTranslator.getString(CURRENCY_CODE.GBP) },
            { id: CURRENCY_CODE.PLN, text: CurrencyCodeTranslator.getString(CURRENCY_CODE.PLN) },
            { id: CURRENCY_CODE.USD, text: CurrencyCodeTranslator.getString(CURRENCY_CODE.USD) },
        ];
    }

    render(h) {
        let optArr = this.getOptionList();

        return (
            <DropdownList
                label={!isNullOrEmpty(this.label) ? this.label : AppState.resources.currencyCode}
                wrap={this.wrap}
                validationState={this.validationState}
                placeholder={this.placeholder}
                options={optArr}
                mandatory={this.mandatory}
                selected={this.selected == null ? null : optArr.find((p) => p.id == this.selected)}
                changed={(e: DropdownListOption) => {
                    this.changed(e?.id as CURRENCY_CODE);
                }}
            />
        );
    }
}

export default toNative(CurrencyCodePicker);
