import { Prop, toNative, Watch } from "vue-facing-decorator";
import { LANGUAGE } from "../../api/data-contracts/enums";
import LocalizedText from "../../api/data-contracts/localized-text";
import { TsxComponentExtended } from "../../app/vuestsx-extended";
import { HintType } from "../../framework/form/form-item-wrapper";
import LocalizedStringInput from "../../framework/input/localized-string-input";
import LocalizedStringTextarea from "../../framework/input/localized-string-textarea";
import { Component } from "../../app/vuetsx";

interface LocalizedInfoInputArgs {
    label: string;
    wrap?: boolean;
    value: LocalizedText;
    placeholder?: string;
    subtitle?: string;
    hint?: string;
    validationState?: ValidationState;
    displayType?: "input" | "textarea";
    changed: (e: LocalizedText) => void;
    mandatory?: boolean;
}

@Component
class LocalizedInfoInput extends TsxComponentExtended<LocalizedInfoInputArgs> implements LocalizedInfoInputArgs {
    @Prop() label: string;
    @Prop() wrap?: boolean;
    @Prop() value: LocalizedText;
    @Prop() placeholder!: string;
    @Prop() subtitle!: string;
    @Prop() hint!: string;
    @Prop() displayType: "input" | "textarea";
    @Prop() changed: (e: LocalizedText) => void;
    @Prop() validationState!: ValidationState;
    @Prop() mandatory?: boolean;

    currentValue: ILocalizedString = this.getValue();

    getValueForTmrLanguage(lang: LANGUAGE): string {
        return this.value[lang];
    }

    getValue(): ILocalizedString {
        if (this.value == null) {
            return {
                Czech: null,
                English: null,
                German: null,
                Italian: null,
                Latvian: null,
                Polish: null,
                Slovak: null,
                Hungarian: null,
            };
        }

        return {
            Czech: this.getValueForTmrLanguage(LANGUAGE.cs),
            English: this.getValueForTmrLanguage(LANGUAGE.en),
            German: this.getValueForTmrLanguage(LANGUAGE.de),
            Italian: this.getValueForTmrLanguage(LANGUAGE.it),
            Latvian: null,
            Polish: this.getValueForTmrLanguage(LANGUAGE.pl),
            Slovak: this.getValueForTmrLanguage(LANGUAGE.sk),
            Hungarian: this.getValueForTmrLanguage(LANGUAGE.hu),
        };
    }

    mounted() {
        this.currentValue = this.getValue();
    }

    @Watch("value")
    updateValue() {
        this.currentValue = this.getValue();
    }

    valueChanged(e: ILocalizedString) {
        if (e == null) {
            this.changed(null);
            return;
        }

        let retObj: LocalizedText = {} as any;
        const addLocalizedValue = (lang: LANGUAGE, value: string): void => {
            if (!isNullOrEmpty(value)) {
                retObj[lang] = value;
            }
        };

        addLocalizedValue(LANGUAGE.sk, e.Slovak);
        addLocalizedValue(LANGUAGE.cs, e.Czech);
        addLocalizedValue(LANGUAGE.en, e.English);
        addLocalizedValue(LANGUAGE.de, e.German);
        addLocalizedValue(LANGUAGE.pl, e.Polish);
        addLocalizedValue(LANGUAGE.it, e.Italian);
        addLocalizedValue(LANGUAGE.hu, e.Hungarian);
        this.currentValue = e;
        this.changed(retObj);
    }

    render(h) {
        if (this.displayType != "input") {
            return (
                <LocalizedStringTextarea
                    label={this.label}
                    wrap={this.wrap}
                    value={this.currentValue}
                    validationState={this.validationState}
                    mandatory={this.mandatory}
                    subtitle={this.subtitle}
                    hint={this.hint}
                    hintType={HintType.Label}
                    changed={(e) => {
                        this.valueChanged(e);
                    }}
                    supportedLanguages={[Language.Slovak, Language.English, Language.Czech, Language.German, Language.Polish, Language.Italian, Language.Hungarian]}
                />
            );
        } else {
            return (
                <LocalizedStringInput
                    label={this.label}
                    wrap={this.wrap}
                    value={this.currentValue}
                    placeholder={this.placeholder}
                    validationState={this.validationState}
                    mandatory={this.mandatory}
                    subtitle={this.subtitle}
                    hint={this.hint}
                    hintType={HintType.Label}
                    changed={(e) => {
                        this.valueChanged(e);
                    }}
                    supportedLanguages={[Language.Slovak, Language.English, Language.Czech, Language.German, Language.Polish, Language.Italian, Language.Hungarian]}
                />
            );
        }
    }
}

export default toNative(LocalizedInfoInput);
