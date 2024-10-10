import { toNative, Prop, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import FormItemWrapper, { FormItemWrapperArgs, MarginType } from "../form/form-item-wrapper";
import Tabs, { TabsRenderMode } from "../tabs/tabs";
import { TabPage } from "../tabs/tab-page";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";
import WysiwigEditor from "./wysiwig";
import LocalizedText from "../../api/data-contracts/localized-text";

interface LocalizedStringInputArgs extends FormItemWrapperArgs {
    value: LocalizedText;
    changed: (e: LocalizedText) => void;
    supportedLanguages?: Language[];
    placeholder?: string;
}

@Component
class LocalizedStringWysiwig extends TsxComponent<LocalizedStringInputArgs> implements LocalizedStringInputArgs {
    @Prop() label!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() subtitle!: string;
    @Prop() value!: LocalizedText;
    @Prop() changed: (e: LocalizedText) => void;
    @Prop() supportedLanguages?: Language[];
    @Prop() marginType?: MarginType;
    @Prop() maxWidth?: number;
    @Prop() placeholder!: string;
    @Prop() mandatory!: boolean;
    @Prop() wrap!: boolean;
    @Prop() hint: string;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    currentValue: LocalizedText = this.value;

    mounted() {
        this.currentValue = this.value;
    }

    @Watch("value")
    updateValue() {
        this.currentValue = this.value;
    }

    raiseChangeEvent(newValue: LocalizedText): void {
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
        let value = this.currentValue || ({} as LocalizedText);
        value[LanguageUtils.getLanguageCode(lang)] = newValue;
        this.raiseChangeEvent(value);
    }

    getActualValue(lang: Language, value: LocalizedText): string {
        if (value == null) {
            return null;
        }

        return value[LanguageUtils.getLanguageCode(lang)];
    }

    render(h) {
        let langArr = this.supportedLanguages == null ? LanguageUtils.getLanguageList() : LanguageUtils.getLanguageList().filter((p) => this.supportedLanguages.contains(p.id));
        let initialTabIndex = langArr.map((p) => p.id).indexOf(AppState.currentLanguage);
        if (initialTabIndex == null || initialTabIndex < 1) {
            initialTabIndex = 0;
        }

        return (
            <FormItemWrapper
                cssClass={"localized-string-wysiwyg localized-input " + (this.currentValue != null ? "hasval" : "empty")}
                label={this.label}
                mandatory={this.mandatory}
                wrap={this.wrap}
                appendIcon={this.appendIcon}
                prependIcon={this.prependIcon}
                hint={this.hint}
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
                            icon={null}
                            key={lang.id}
                        >
                            <WysiwigEditor
                                key={lang.id}
                                wrap={false}
                                label={null}
                                value={this.getActualValue(lang.id, this.currentValue ?? this.value)}
                                changed={(e) => {
                                    this.changeValue(lang.id, e);
                                }}
                            />
                        </TabPage>
                    ))}
                </Tabs>
            </FormItemWrapper>
        );
    }
}

export default toNative(LocalizedStringWysiwig);
