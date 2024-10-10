import { Prop, toNative } from "vue-facing-decorator";
import { DANGER } from "../../api/data-contracts/enums";
import TsxComponent, { Component } from "../../app/vuetsx";
import DropdownList, { DropdownListOption } from "../../framework/dropdown";
import DangerTranslator from "../../utils/enum-translation/danger-translator";

interface DangerPickerArgs {
    selected: DANGER;
    mandatory?: boolean;
    label?: string;
    placeholder?: string;
    validationState?: ValidationState;
    wrap?: boolean;
    changed: (e: DANGER) => void;
}

@Component
class DangerPicker extends TsxComponent<DangerPickerArgs> implements DangerPickerArgs {
    @Prop() selected: DANGER;
    @Prop() mandatory!: boolean;
    @Prop() label!: string;
    @Prop() placeholder!: string;
    @Prop() wrap!: boolean;
    @Prop() changed: (e: DANGER) => void;

    getOptionList(): DropdownListOption[] {
        return [
            { id: DANGER.NONE, text: DangerTranslator.getString(DANGER.NONE) },
            { id: DANGER.LOW, text: DangerTranslator.getString(DANGER.LOW) },
            { id: DANGER.MODERATE, text: DangerTranslator.getString(DANGER.MODERATE) },
            { id: DANGER.INCREASED, text: DangerTranslator.getString(DANGER.INCREASED) },
            { id: DANGER.HIGH, text: DangerTranslator.getString(DANGER.HIGH) },
            { id: DANGER.VERY_HIGH, text: DangerTranslator.getString(DANGER.VERY_HIGH) },
        ];
    }

    render(h) {
        let optArr = this.getOptionList();

        return (
            <DropdownList
                label={!isNullOrEmpty(this.label) ? this.label : AppState.resources.difficultyCaption}
                wrap={this.wrap}
                validationState={this.validationState}
                placeholder={this.placeholder}
                options={optArr}
                mandatory={this.mandatory}
                selected={this.selected == null ? null : optArr.find((p) => p.id == this.selected)}
                changed={(e: DropdownListOption) => {
                    this.changed(e?.id as DANGER);
                }}
            />
        );
    }
}

export default toNative(DangerPicker);
