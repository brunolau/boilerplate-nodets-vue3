import { Prop, toNative } from "vue-facing-decorator";
import { LANGUAGE } from "../../api/data-contracts/enums";
import TsxComponent, { Component } from "../../app/vuetsx";
import DropdownList, { DropdownListOption } from "../../framework/dropdown";

interface LanguagePickerArgs {
    selected: LANGUAGE;
    mandatory?: boolean;
    label?: string;
    placeholder?: string;
    validationState?: ValidationState;
    wrap?: boolean;
    changed: (e: LANGUAGE) => void;
}

@Component
class LanguagePicker extends TsxComponent<LanguagePickerArgs> implements LanguagePickerArgs {
    @Prop() selected: LANGUAGE;
    @Prop() mandatory!: boolean;
    @Prop() label!: string;
    @Prop() placeholder!: string;
    @Prop() wrap!: boolean;
    @Prop() changed: (e: LANGUAGE) => void;

    getOptionList(): DropdownListOption[] {
        return [
            { id: LANGUAGE.cs, text: AppState.resources.czech },
            { id: LANGUAGE.de, text: AppState.resources.german },
            { id: LANGUAGE.en, text: AppState.resources.english },
            { id: LANGUAGE.it, text: AppState.resources.italian },
            { id: LANGUAGE.pl, text: AppState.resources.polish },
            { id: LANGUAGE.sk, text: AppState.resources.slovak },
            { id: LANGUAGE.hu, text: AppState.resources.hungary },
        ];
    }

    render(h) {
        let optArr = this.getOptionList();

        return (
            <DropdownList
                label={!isNullOrEmpty(this.label) ? this.label : AppState.resources.languageCaption}
                wrap={this.wrap}
                validationState={this.validationState}
                placeholder={this.placeholder}
                options={optArr}
                mandatory={this.mandatory}
                selected={this.selected == null ? null : optArr.find((p) => p.id == this.selected)}
                changed={(e: DropdownListOption) => {
                    this.changed(e?.id as LANGUAGE);
                }}
            />
        );
    }
}

export default toNative(LanguagePicker);
