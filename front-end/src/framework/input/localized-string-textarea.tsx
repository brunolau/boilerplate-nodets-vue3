import { Prop, toNative, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import FormItemWrapper, { FormItemWrapperArgs, HintType, MarginType } from "../form/form-item-wrapper";
import Tabs, { TabsRenderMode } from "../tabs/tabs";
import { TabPage } from "../tabs/tab-page";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";
import TextArea from "./textarea";

interface LocalizedStringInputArgs extends FormItemWrapperArgs {
    value: ILocalizedString;
    changed: (e: ILocalizedString) => void;
    supportedLanguages?: Language[];
    placeholder?: string;
}

@Component
class LocalizedStringTextarea extends TsxComponent<LocalizedStringInputArgs> implements LocalizedStringInputArgs {
    @Prop() label!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() subtitle!: string;
    @Prop() value!: ILocalizedString;
    @Prop() changed: (e: ILocalizedString) => void;
    @Prop() supportedLanguages?: Language[];
    @Prop() marginType?: MarginType;
    @Prop() maxWidth?: number;
    @Prop() placeholder!: string;
    @Prop() mandatory!: boolean;
    @Prop() wrap!: boolean;
    @Prop() hint: string;
    @Prop() hintType!: HintType;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    currentValue: ILocalizedString = this.value;

    mounted() {
        this.currentValue = this.value;
    }

    @Watch("value")
    updateValue() {
        this.currentValue = this.value;
    }

    raiseChangeEvent(newValue: ILocalizedString): void {
        this.populateValidationDeclaration();

        if (this.changed != null) {
            if (newValue != null) {
                newValue = JSON.parse(JSON.stringify(newValue));
            }

            this.currentValue = newValue;
            this.changed(newValue);
        }
    }

    changeValue(lang: Language, newValue: string): void {
        let value = this.currentValue || ({} as ILocalizedString);
        value[LanguageUtils.getLocalizedStringProperty(lang)] = newValue;
        this.raiseChangeEvent(value);
    }

    getActualValue(lang: Language, value: ILocalizedString): string {
        if (value == null) {
            return null;
        }

        return value[LanguageUtils.getLocalizedStringProperty(lang)];
    }

    render(h) {
        let langArr = this.supportedLanguages == null ? LanguageUtils.getLanguageList() : LanguageUtils.getLanguageList().filter((p) => this.supportedLanguages.contains(p.id));
        let initialTabIndex = langArr.map((p) => p.id).indexOf(AppState.currentLanguage);
        if (initialTabIndex == null || initialTabIndex < 1) {
            initialTabIndex = 0;
        }

        return (
            <FormItemWrapper
                cssClass={"localized-string-input localized-input " + (this.value != null ? "hasval" : "empty")}
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
                <Tabs renderMode={TabsRenderMode.Normal} initialTabIndex={initialTabIndex}>
                    {langArr.map((lang) => (
                        <TabPage
                            navCaption={'<img src="' + LanguageUtils.getLanguageFlagUrl(lang.flag) + '"/>&nbsp;' + LanguageUtils.getLanguageCode(lang.id).toUpperCase()}
                            escapeCaption={false}
                            key={lang.id}
                            icon={null}
                        >
                            <TextArea
                                key={lang.id}
                                wrap={false}
                                label={null}
                                value={this.getActualValue(lang.id, this.currentValue ?? this.value)}
                                changed={(e) => {
                                    this.changeValue(lang.id, e);
                                }}
                                rows={4}
                            />
                        </TabPage>
                    ))}
                </Tabs>
            </FormItemWrapper>
        );
    }
}

export default toNative(LocalizedStringTextarea);
