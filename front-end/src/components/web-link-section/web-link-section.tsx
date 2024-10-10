import { Prop, toNative } from "vue-facing-decorator";
import { TsxComponentExtended } from "../../app/vuestsx-extended";
import Button from "../../framework/button/button";
import { ButtonLayout, ButtonSize } from "../../framework/button/button-layout";
import FlexContainer from "../../framework/form/flex-container";
import FlexFormItem from "../../framework/form/form-item-flex";
import FormItemWrapper from "../../framework/form/form-item-wrapper";
import TextButton from "../../framework/button/text-button";
import { WebLinkSection } from "../../api/data-contracts/web-link-section";
import WebLinkSectionEditModal from "./components/web-link-section-edit-modal";
import LocalizedInfoInput from "../inputs/localized-info-input";
import SortableContainer, { SortableOnSortedArgs } from "../../framework/sortable/sortable-container";
import "./css/web-link-section.css";
import { Component } from "../../app/vuetsx";

export interface WebLinkSectionModel {
    webLinkSections: WebLinkSection[];
}

interface WebLinkSectionArgs {
    parentModel: WebLinkSectionModel;
    label?: string;
}

interface WebLinkSectionItemArgs {
    webLinkSection: WebLinkSection;
    addNewClicked: () => void;
    removeClicked: () => void;
}

const webLinkSectionContainerValidations: ValidationRuleset<WebLinkSectionContainerComponent> = {
    parentModel: ValidationBuilder().required().build(),
};

const webLinkSectionItemValidations: ValidationRuleset<WebLinkSectionItemComponent> = {};

@Component({ validations: ValidationHelper.instance.transformRuleset(webLinkSectionContainerValidations) })
class WebLinkSectionContainerComponent extends TsxComponentExtended<WebLinkSectionArgs> implements WebLinkSectionArgs {
    @Prop() label?: string;
    @Prop() parentModel: WebLinkSectionModel;

    async mounted() {
        this.prepareValue();
    }

    prepareValue() {
        if (this.parentModel.webLinkSections == null) {
            this.parentModel.webLinkSections = [];
        }
    }

    getNewWebLinkSection(): WebLinkSection {
        return {
            items: [],
            title: null,
        };
    }

    getWebLinkSectionItemControl(index: number): WebLinkSectionItemComponent {
        return this.$refs["webLinkSection" + index] as WebLinkSectionItemComponent;
    }

    resetValidation() {
        if (this.parentModel.webLinkSections != null) {
            this.parentModel.webLinkSections.forEach((item, i) => {
                try {
                    this.getWebLinkSectionItemControl(i).resetValidation();
                } catch (e) {}
            });
        }

        super.resetValidation();
    }

    validate(showErrorMessage) {
        let valid = super.validate(showErrorMessage);
        if (this.parentModel.webLinkSections != null) {
            this.parentModel.webLinkSections.forEach((item, i) => {
                var itemResult: boolean;
                try {
                    itemResult = this.getWebLinkSectionItemControl(i).validate(false);
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

    addNewWebLinkSection() {
        if (this.parentModel.webLinkSections == null) {
            this.parentModel.webLinkSections = [];
        }

        this.parentModel.webLinkSections.push(this.getNewWebLinkSection());
    }

    removeWebLinkSection(value: WebLinkSection): void {
        this.parentModel.webLinkSections.remove(value);
    }

    sortWebLinkSection(e: SortableOnSortedArgs): void {
        let webLinkSections = this.parentModel.webLinkSections;
        let webLink = webLinkSections[e.oldIndex];

        if (webLink != null) {
            webLinkSections.remove(webLink);
            webLinkSections.splice(e.newIndex, 0, webLink);
        }
    }

    render(h) {
        if (this.parentModel.webLinkSections == null) {
            return null;
        }

        return (
            <FormItemWrapper label={this.label || this.resources.webLinkLabel}>
                <SortableContainer
                    handleSelector={".dragButton"}
                    sortComplete={(p) => {
                        this.sortWebLinkSection(p);
                    }}
                    cssClass={"webLinkSortableContainer"}
                >
                    {this.parentModel.webLinkSections.map((item, i) => (
                        <WebLinkSectionItem
                            ref={"webLinkSection" + i}
                            key={"webLinkSection" + crypto.randomUUID()}
                            webLinkSection={item}
                            addNewClicked={() => {
                                this.addNewWebLinkSection();
                            }}
                            removeClicked={() => {
                                this.removeWebLinkSection(item);
                            }}
                        />
                    ))}
                </SortableContainer>

                <TextButton
                    icon="icon icon-plus"
                    text={this.resources.add}
                    clicked={() => {
                        this.addNewWebLinkSection();
                    }}
                />
            </FormItemWrapper>
            // <FormItemWrapper label={this.label || this.resources.webLinkLabel}>
            //     {this.parentModel.webLinkSections.map((item, i) =>
            //         <WebLinkSectionItem
            //             ref={"webLinkSection" + i}
            //             key={"webLinkSection" + i}
            //             webLinkSection={item}
            //             addNewClicked={() => { this.addNewWebLinkSection() }}
            //             removeClicked={() => { this.removeWebLinkSection(item) }}
            //         />
            //     )}

            //     <TextButton icon="icon icon-plus" text={this.resources.add} clicked={() => { this.addNewWebLinkSection() }} />
            // </FormItemWrapper>
        );
    }
}

export const WebLinkSectionContainer = toNative(WebLinkSectionContainerComponent);

@Component({ validations: ValidationHelper.instance.transformRuleset(webLinkSectionItemValidations) })
class WebLinkSectionItemComponent extends TsxComponentExtended<WebLinkSectionItemArgs> implements WebLinkSectionItemArgs {
    @Prop() webLinkSection: WebLinkSection;
    @Prop() addNewClicked: () => void;
    @Prop() removeClicked: () => void;

    renderButtons(h) {
        return (
            <div class="webLinkSectionButtons">
                <Button
                    layout={ButtonLayout.Default}
                    outlined={true}
                    size={ButtonSize.Small}
                    iconButton={true}
                    icon="icon icon-pencil"
                    clicked={() => {
                        this.getWebLinkSectionEditModal().show({
                            parentModel: this.webLinkSection,
                            label: this.resources.webLinkLabel,
                            completed: (e) => {
                                this.webLinkSection.items = e.model.items;
                            },
                        });
                    }}
                />
                <Button layout={ButtonLayout.Default} outlined={true} size={ButtonSize.Small} iconButton={true} icon="icon icon-menu" cssClass="dragButton" clicked={() => {}} />
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
            </div>
        );
    }

    getWebLinkSectionEditModal() {
        return this.$refs.webLinkSectionEditModal as typeof WebLinkSectionEditModal.prototype;
    }

    render(h) {
        return (
            <FlexContainer fullWidthOnMobile={true}>
                <FlexFormItem flexFill={true}>
                    <LocalizedInfoInput
                        wrap={false}
                        mandatory={true}
                        displayType={"input"}
                        placeholder={this.resources.webLinkSectionName}
                        label={null}
                        value={this.webLinkSection.title}
                        changed={(e) => {
                            this.webLinkSection.title = e;
                        }}
                    />
                </FlexFormItem>
                <FlexFormItem flexFill={false} width={150}>
                    {this.renderButtons(h)}
                </FlexFormItem>
                <WebLinkSectionEditModal ref={"webLinkSectionEditModal"} />
            </FlexContainer>
        );
    }
}

export const WebLinkSectionItem = toNative(WebLinkSectionItemComponent);
