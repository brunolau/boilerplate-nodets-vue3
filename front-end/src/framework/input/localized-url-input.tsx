import { toNative, Prop, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import FormItemWrapper, { FormItemWrapperArgs, MarginType } from "../form/form-item-wrapper";
import Modal, { ModalSize } from "../modal/modal";
import ModalBody from "../modal/modal-body";
import ModalFooter from "../modal/modal-footer";
import Button from "../button/button";
import { ButtonLayout, ButtonSize } from "../button/button-layout";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";
import "./css/localized-string-input.css";
import FlexContainer from "../form/flex-container";
import FlexFormItem from "../form/form-item-flex";
import { FileManagerDialog, FileManagerModalFileType } from "../modal/ts/file-manager-dialog";

interface LocalizedUrlInputArgs extends FormItemWrapperArgs {
    value: ILocalizedString;
    changed: (e: ILocalizedString) => void;
    supportedLanguages?: Language[];
    placeholder?: string;
}

@Component
class LocalizedUrlInput extends TsxComponent<LocalizedUrlInputArgs> implements LocalizedUrlInputArgs {
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
    @Prop() cssClass: string;
    @Prop() hint: string;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    currentValue: ILocalizedString;
    modalWillShow: boolean = false;
    isModal: boolean = false;
    uuid: string = "lsw-" + portalUtils.randomString(10);

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
            this.currentValue = newValue;
            this.changed(newValue);
        }
    }

    isAllSame(): boolean {
        if (this.currentValue != null) {
            let langList = LanguageUtils.getLanguageList();
            let skValue = LocalizedStringHelper.getValue(this.currentValue, Language.Slovak);

            for (let i = 0, len = langList.length; i < len; i++) {
                if (LocalizedStringHelper.getValue(this.currentValue, langList[i].id) != skValue) {
                    return false;
                }
            }
        }

        return true;
    }

    hasSomeValue(): boolean {
        return !isNullOrEmpty(LocalizedStringHelper.getValue(this.currentValue, Language.Slovak));
    }

    getModalContext(): JQuery {
        return $("#" + this.uuid);
    }

    showInputModal(): void {
        this.modalWillShow = true;
        this.currentValue = JSON.parse(JSON.stringify(this.currentValue || {}));

        this.$nextTick(() => {
            (this.$refs.dlgLocalizedString as typeof Modal.prototype).show({
                onShown: () => {
                    setTimeout(() => {
                        let input = this.getModalContext().find('.lsi-main-input[data-inv-lang="' + AppState.currentLanguage + '"]');
                        if (input.length == 0) {
                            input = this.getModalContext().find(".lsi-main-input:visible");
                        }

                        input.first().focus();
                    }, 15);
                },
            });
        });
    }

    updateUrl(lang?) {
        FileManagerDialog.show({
            fileType: FileManagerModalFileType.All,
            callback: (data) => {
                this.onModalValueChange(data.url, lang);
            },
        });
    }

    previewItem(url) {
        if (!url.match(/^[a-zA-Z]+:\/\//)) {
            url = "http://" + url;
        }
        window.open(url, "_blank");
    }

    onModalValueChange(newValue: string, lang?: LanguageUtils.LanguageListItem) {
        this.currentValue = JSON.parse(JSON.stringify(this.currentValue || {}));
        var value = this.currentValue;
        var propName = LanguageUtils.getLocalizedStringProperty(lang?.id) || "Slovak";
        value[propName] = newValue;

        this.getModalContext()
            .find("[data-inv-lang]")
            .each(function () {
                var $this = $(this);
                var currentVal = $this.val() as string;

                if (currentVal == null || currentVal.length == 0) {
                    var language: Language = Number($this.attr("data-inv-lang"));
                    var lsValue = LocalizedStringHelper.getValue(value, language) || "";
                    $this.attr("placeholder", lsValue);
                }
            });
        if (!this.isModal) {
            this.raiseChangeEvent(value);
        }
    }

    render(h) {
        return (
            <div class={this.cssClass}>
                <FormItemWrapper
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
                    {this.renderInput(h)}
                </FormItemWrapper>
                {this.modalWillShow && this.renderModal(h)}
            </div>
        );
    }

    renderInput(h) {
        let allSame = this.isAllSame();
        let hasValue = this.hasSomeValue();

        if (allSame && !hasValue) {
            return this.renderInputPlaceholder(h);
        } else if (allSame) {
            return this.renderInputGlobalValue(h);
        } else {
            return this.renderInputMultipleValues(h);
        }
    }

    renderInputPlaceholder(h) {
        return (
            <FlexContainer fullWidthOnMobile={false}>
                <FlexFormItem flexFill={true}>
                    <div class="form-control localized-input-wrap lii-placeholder" onClick={(e) => this.showInputModal()}>
                        {this.placeholder}
                    </div>
                </FlexFormItem>
                <FlexFormItem flexFill={false} width={46}>
                    <Button
                        layout={ButtonLayout.Success}
                        outlined={true}
                        size={ButtonSize.Regular}
                        iconButton={true}
                        icon={"now-ui-icons arrows-1_cloud-upload-94"}
                        clicked={() => {
                            this.isModal = false;
                            this.updateUrl();
                        }}
                    />
                </FlexFormItem>
            </FlexContainer>
        );
    }

    renderInputGlobalValue(h) {
        let langValue = LocalizedStringHelper.getValue(this.currentValue, Language.Slovak);
        return (
            <FlexContainer cssClass={"mb-1"} fullWidthOnMobile={false}>
                <FlexFormItem flexFill={true}>
                    <div class="form-control localized-input-wrap localized-url-wrap" onClick={(e) => this.showInputModal()}>
                        <img src="https://inviton-cdn.azureedge.net/assets/img/flags/global.png" />
                        &nbsp;{langValue}
                    </div>
                </FlexFormItem>
                <FlexFormItem flexFill={false} width={45}>
                    <Button
                        layout={ButtonLayout.Success}
                        outlined={true}
                        size={ButtonSize.Regular}
                        iconButton={true}
                        icon={"now-ui-icons arrows-1_cloud-upload-94"}
                        clicked={() => {
                            this.isModal = false;
                            this.updateUrl();
                        }}
                    />
                </FlexFormItem>
                <FlexFormItem flexFill={false} width={45}>
                    <Button
                        layout={ButtonLayout.Info}
                        outlined={true}
                        size={ButtonSize.Regular}
                        iconButton={true}
                        icon={"now-ui-icons ui-1_zoom-bold"}
                        clicked={() => {
                            this.previewItem(langValue);
                        }}
                    />
                </FlexFormItem>
            </FlexContainer>
        );
    }

    renderInputMultipleValues(h) {
        return (
            <div class="form-control localized-input-wrap lii-more" onClick={(e) => this.showInputModal()}>
                {LanguageUtils.getLanguageList().map((lang) => {
                    if (this.supportedLanguages != null && !this.supportedLanguages.contains(lang.id)) {
                        return null;
                    }

                    let langValue = this.currentValue[LanguageUtils.getLocalizedStringProperty(lang.id)];
                    let hasValue = !isNullOrEmpty(langValue);
                    langValue = hasValue ? langValue : LocalizedStringHelper.getValue(this.currentValue, lang.id);

                    return (
                        <div class={"localized-input-item" + (hasValue ? "" : " lii-auto")}>
                            <img src={LanguageUtils.getLanguageFlagUrl(lang.flag)} />
                            &nbsp;{langValue}
                        </div>
                    );
                })}
            </div>
        );
    }

    renderModal(h) {
        return (
            <Modal ref="dlgLocalizedString" title={this.label} size={ModalSize.Large}>
                {this.currentValue != null && (
                    <ModalBody>
                        <div id={this.uuid}>
                            {LanguageUtils.getLanguageList().map((lang) => {
                                if (this.supportedLanguages != null && !this.supportedLanguages.contains(lang.id)) {
                                    return null;
                                }

                                let langValue = this.currentValue[LanguageUtils.getLocalizedStringProperty(lang.id)];
                                let hasValue = !isNullOrEmpty(langValue);
                                langValue = hasValue ? langValue : LocalizedStringHelper.getValue(this.currentValue, lang.id);

                                return (
                                    <FlexContainer cssClass={"mb-1"} fullWidthOnMobile={false}>
                                        <FlexFormItem flexFill={true}>
                                            <div class="row lsi-form-group">
                                                <label class="col-md-3 col-form-label lsi-label">
                                                    <span class="lsi-text">{lang.text}&nbsp;&nbsp;</span>
                                                    <img class="lsi-icon" src={LanguageUtils.getLanguageFlagUrl(lang.flag)} />
                                                </label>
                                                <div class="col-md-9">
                                                    <div class="form-group maxwidth-input ">
                                                        <input
                                                            type="text"
                                                            data-inv-lang={lang.id}
                                                            placeholder={hasValue ? "" : langValue}
                                                            class="form-control maxwidth-input lsi-main-input"
                                                            onChange={(e) => this.onModalValueChange(e.target.value, lang)}
                                                            onKeyup={(e) => this.onModalValueChange(e.target.value, lang)}
                                                            value={hasValue ? langValue : null}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </FlexFormItem>
                                        <FlexFormItem flexFill={false} width={44}>
                                            <Button
                                                layout={ButtonLayout.Success}
                                                outlined={true}
                                                size={ButtonSize.Regular}
                                                iconButton={true}
                                                icon={"now-ui-icons arrows-1_cloud-upload-94"}
                                                clicked={() => {
                                                    this.isModal = true;
                                                    this.updateUrl(lang);
                                                }}
                                            />
                                        </FlexFormItem>
                                        <FlexFormItem flexFill={false} width={44}>
                                            <Button
                                                layout={ButtonLayout.Info}
                                                outlined={true}
                                                size={ButtonSize.Regular}
                                                iconButton={true}
                                                icon={"now-ui-icons ui-1_zoom-bold"}
                                                clicked={() => {
                                                    this.previewItem(langValue);
                                                }}
                                            />
                                        </FlexFormItem>
                                    </FlexContainer>
                                );
                            })}
                        </div>
                    </ModalBody>
                )}
                <ModalFooter>
                    <Button dismissModal={true} text={AppState.resources.cancel} layout={ButtonLayout.Default} clicked={() => {}} />
                    <Button
                        dismissModal={true}
                        text="OK"
                        layout={ButtonLayout.Primary}
                        clicked={() => {
                            this.raiseChangeEvent(this.currentValue);
                        }}
                    />
                </ModalFooter>
            </Modal>
        );
    }
}

export default toNative(LocalizedUrlInput);
