import { Prop, toNative } from "vue-facing-decorator";
import { TsxComponentExtended } from "../../../app/vuestsx-extended";
import TmrModalHelper from "../../modal-wrap/tmr-modal-helper";
import Button from "../../../framework/button/button";
import { ButtonLayout, ButtonSize } from "../../../framework/button/button-layout";
import Modal from "../../../framework/modal/modal";
import ModalBody from "../../../framework/modal/modal-body";
import ModalFooter from "../../../framework/modal/modal-footer";
import FlexContainer from "../../../framework/form/flex-container";
import FlexFormItem from "../../../framework/form/form-item-flex";
import LocalizedInfoInput from "../../inputs/localized-info-input";
import FormItemWrapper from "../../../framework/form/form-item-wrapper";
import { WebLinkItem, WebLinkSection } from "../../../api/data-contracts/web-link-section";
import AttractionLinkIconPicker from "../../dropdowns/web_link_icon_picker";
import LocalizedValueHelper from "../../../utils/localized-value-helper";
import SortableContainer, { SortableOnSortedArgs } from "../../../framework/sortable/sortable-container";
import "../css/web-link-section-edit-modal.css";
import { Component } from "../../../app/vuetsx";

interface WebLinkSectionEditModalBindingArgs {}

interface WebLinkSectionEditModalShowArgs {
    label?: string;
    parentModel: WebLinkSection;
    completed: (e: WebLinkSectionEditModalResponse) => void;
}

interface WebLinkSectionEditModalResponse {
    model: WebLinkSection;
}

interface WebLinkSectionEditModalItemArgs {
    webLinkItem: WebLinkItem;
    isFirst: boolean;
    addNewClicked: () => void;
    removeClicked: () => void;
}

const webLinkSectionValidations: ValidationRuleset<WebLinkSectionEditModal> = {
    parentModelCopy: ValidationBuilder().required().build(),
};

const webLinkSectionItemValidations: ValidationRuleset<WebLinkSectionEditModalItemComponent> = {
    webLinkItem: {
        name: ValidationBuilder()
            .customRule("web_link_item_name", function (this: WebLinkSectionEditModalItemComponent) {
                return LocalizedValueHelper.validateLocalizedValue(this.webLinkItem.name);
            })
            .build(),

        url: ValidationBuilder()
            .customRule("web_link_item_url", function (this: WebLinkSectionEditModalItemComponent) {
                return LocalizedValueHelper.validateLocalizedValue(this.webLinkItem.url);
            })
            .build(),

        icon: ValidationBuilder().required().build(),
    },
};

@Component({ validations: ValidationHelper.instance.transformRuleset(webLinkSectionValidations) })
class WebLinkSectionEditModal extends TsxComponentExtended<WebLinkSectionEditModalBindingArgs> implements WebLinkSectionEditModalBindingArgs {
    label?: string = null;
    parentModelCopy: WebLinkSection = null;

    completed: (e: WebLinkSectionEditModalResponse) => void = null;

    show(args: WebLinkSectionEditModalShowArgs): void {
        this.blockRoot = true;
        this.$nextTick(async () => {
            this.getModal().show();

            this.label = args.label;
            this.parentModelCopy = JSON.parse(JSON.stringify(args.parentModel));
            this.completed = args.completed;

            this.prepareValue();

            this.blockRoot = false;
        });
    }

    hideModal(): void {
        this.getModal().hide();
    }

    getModal() {
        return this.$refs.editModal as typeof Modal.prototype;
    }

    prepareValue() {
        if (this.parentModelCopy.items == null) {
            this.parentModelCopy.items = [];
        }

        if (this.parentModelCopy.items.length == 0) {
            this.parentModelCopy.items.push(this.getNewWebLinkItem());
        }
    }

    getNewWebLinkItem(): WebLinkItem {
        return {
            icon: null,
            name: null,
            url: null,
        };
    }

    getWebLinkItemControl(index: number): WebLinkSectionEditModalItemComponent {
        return this.$refs["webLinkItem" + index] as WebLinkSectionEditModalItemComponent;
    }

    resetValidation() {
        if (this.parentModelCopy.items != null) {
            this.parentModelCopy.items.forEach((item, i) => {
                try {
                    this.getWebLinkItemControl(i).resetValidation();
                } catch (e) {}
            });
        }

        super.resetValidation();
    }

    validate(showErrorMessage?: boolean) {
        let valid = super.validate(showErrorMessage);
        if (this.parentModelCopy.items != null) {
            this.parentModelCopy.items.forEach((item, i) => {
                var itemResult: boolean;
                try {
                    itemResult = this.getWebLinkItemControl(i).validate(false);
                } catch (e) {
                    itemResult = true;
                }

                if (itemResult == false) {
                    valid = false;
                }
            });
        }

        return valid;
    }

    addNewWebLinkItem() {
        this.parentModelCopy.items.push(this.getNewWebLinkItem());
    }

    removeWebLinkItem(value: WebLinkItem): void {
        this.parentModelCopy.items.remove(value);
    }

    sortWebLinkItem(e: SortableOnSortedArgs): void {
        let webLinkItems = this.parentModelCopy?.items;
        let webLinkItem = webLinkItems[e.oldIndex];

        if (webLinkItem != null) {
            webLinkItems.remove(webLinkItem);
            webLinkItems.splice(e.newIndex, 0, webLinkItem);
        }
    }

    saveClicked() {
        if (!this.validate(true)) {
            return;
        }

        this.hideModal();

        if (this.completed != null) {
            this.completed({
                model: this.parentModelCopy,
            });
        }
    }

    render(h) {
        return (
            <Modal title={this.resources.webLinkLabel} ref="editModal" size={TmrModalHelper.getSize()} blocked={this.blockRoot == true}>
                <ModalBody>
                    <FormItemWrapper label={this.label || this.resources.webLinkLabel}>
                        <SortableContainer
                            handleSelector={".dragButton"}
                            sortComplete={(p) => {
                                this.sortWebLinkItem(p);
                            }}
                            filterSelector={".divider"}
                            cssClass={"webLinkItemSortableContainer"}
                        >
                            {this.parentModelCopy?.items?.map((item, i) => (
                                <WebLinkSectionEditModalItem
                                    ref={"webLinkItem" + i}
                                    key={"webLinkItem" + crypto.randomUUID()}
                                    webLinkItem={item}
                                    isFirst={i == 0}
                                    addNewClicked={() => {
                                        this.addNewWebLinkItem();
                                    }}
                                    removeClicked={() => {
                                        this.removeWebLinkItem(item);
                                    }}
                                />
                            ))}
                        </SortableContainer>
                    </FormItemWrapper>
                </ModalBody>
                <ModalFooter>
                    <Button layout={ButtonLayout.Default} text={this.resources.cancel} dismissModal={true} clicked={(e) => {}} />
                    <Button
                        layout={ButtonLayout.Primary}
                        text={this.resources.save}
                        icon={"far fa-save"}
                        clicked={(e) => {
                            this.saveClicked();
                        }}
                    />
                </ModalFooter>
            </Modal>
        );
    }
}

@Component({ validations: ValidationHelper.instance.transformRuleset(webLinkSectionItemValidations) })
class WebLinkSectionEditModalItemComponent extends TsxComponentExtended<WebLinkSectionEditModalItemArgs> implements WebLinkSectionEditModalItemArgs {
    @Prop() webLinkItem: WebLinkItem;
    @Prop() isFirst: boolean;
    @Prop() addNewClicked: () => void;
    @Prop() removeClicked: () => void;

    renderButtons(h) {
        return (
            <div class="webLinkSectionItemButtons">
                {this.isFirst && (
                    <div>
                        <Button
                            layout={ButtonLayout.Default}
                            outlined={true}
                            size={ButtonSize.Small}
                            iconButton={true}
                            icon="icon icon-plus"
                            clicked={() => {
                                this.addNewClicked();
                            }}
                        />
                    </div>
                )}
                {!this.isFirst && (
                    <Button
                        layout={ButtonLayout.Danger}
                        outlined={true}
                        size={ButtonSize.Small}
                        iconButton={true}
                        icon="icon icon-close"
                        clicked={() => {
                            this.removeClicked();
                        }}
                    />
                )}
                <Button layout={ButtonLayout.Default} outlined={true} size={ButtonSize.Small} iconButton={true} icon="icon icon-menu" cssClass="dragButton" clicked={() => {}} />
            </div>
        );
    }

    render(h) {
        return (
            <div class="webLinkSectionItem">
                <FlexContainer fullWidthOnMobile={true}>
                    <FlexFormItem flexFill={true}>
                        <LocalizedInfoInput
                            wrap={false}
                            mandatory={true}
                            displayType={"input"}
                            placeholder={this.resources.webLinkName}
                            label={null}
                            value={this.webLinkItem.name}
                            validationState={this.validationStateOf(this.v$.webLinkItem.name)}
                            changed={(e) => {
                                this.webLinkItem.name = e;
                            }}
                        />
                    </FlexFormItem>
                    <FlexFormItem flexFill={false} width={100}>
                        {this.renderButtons(h)}
                    </FlexFormItem>
                </FlexContainer>
                <FlexContainer fullWidthOnMobile={true}>
                    <FlexFormItem flexFill={true}>
                        <LocalizedInfoInput
                            wrap={false}
                            mandatory={true}
                            displayType={"input"}
                            placeholder={this.resources.webLinkUrl}
                            label={null}
                            value={this.webLinkItem.url}
                            validationState={this.validationStateOf(this.v$.webLinkItem.url)}
                            changed={(e) => {
                                this.webLinkItem.url = e;
                            }}
                        />
                    </FlexFormItem>
                    <FlexFormItem flexFill={false} width={100} />
                </FlexContainer>
                <FlexContainer fullWidthOnMobile={true}>
                    <FlexFormItem flexFill={true}>
                        <AttractionLinkIconPicker
                            mandatory={true}
                            wrap={false}
                            placeholder={this.resources.webLinkIcon}
                            selected={this.webLinkItem.icon}
                            validationState={this.validationStateOf(this.v$.webLinkItem.icon)}
                            changed={(e) => (this.webLinkItem.icon = e)}
                        />
                    </FlexFormItem>
                    <FlexFormItem flexFill={false} width={100} />
                </FlexContainer>
                <FlexContainer fullWidthOnMobile={true}>
                    <FlexFormItem flexFill={false} width={50} />
                </FlexContainer>
            </div>
        );
    }
}

export const WebLinkSectionEditModalItem = toNative(WebLinkSectionEditModalItemComponent);

export default toNative(WebLinkSectionEditModal);
