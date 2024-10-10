import { Prop, toNative } from "vue-facing-decorator";
import { TsxComponentExtended } from "../../app/vuestsx-extended";
import Button from "../../framework/button/button";
import { ButtonLayout, ButtonSize } from "../../framework/button/button-layout";
import FlexContainer from "../../framework/form/flex-container";
import FlexFormItem from "../../framework/form/form-item-flex";
import FormItemWrapper from "../../framework/form/form-item-wrapper";
import TextBox from "../../framework/input/textbox";
import LocalizedInfoInput from "../inputs/localized-info-input";
import LocalizedText from "../../api/data-contracts/localized-text";
import { SliderItem } from "../../api/data-contracts/slider-item";
import UploadImage from "../../pages/management/resorts/components/upload-resort-image";
import { UploadImageHelper } from "../../common/utils/upload-image-helper";
import { ATTRACTION_TYPE } from "../../api/data-contracts/enums";
import LocalizedValueHelper from "../../utils/localized-value-helper";
import TextButton from "../../framework/button/text-button";
import { Component } from "../../app/vuetsx";

export interface SliderModel {
    sliderArray: SliderItem[];
}

interface SliderContainerArgs {
    parentModel: SliderModel;
}

interface SliderContainerItemArgs {
    sliderItem: SliderItem;
    addNewClicked: () => void;
    removeClicked: () => void;
}

const sliderContainerValidations: ValidationRuleset<SliderContainerComponent> = {
    parentModel: ValidationBuilder().required().build(),
};

const sliderContainerItemValidations: ValidationRuleset<SliderContainerItemComponent> = {
    sliderItem: {
        name: ValidationBuilder()
            .customRule("hot-link-item-name", function (this: SliderContainerItemComponent) {
                if (!this.sliderItem.name || (!this.sliderItem.name && (LocalizedValueHelper.getLocalizedValue(this.sliderItem.description) || this.sliderItem.imageID))) {
                    return false;
                }

                return true;
            })
            .build(),
        description: ValidationBuilder()
            .customRule("hot-link-item-description", function (this: SliderContainerItemComponent) {
                if (
                    !LocalizedValueHelper.getLocalizedValue(this.sliderItem.description) ||
                    (!LocalizedValueHelper.getLocalizedValue(this.sliderItem.description) && (this.sliderItem.name || this.sliderItem.imageID))
                ) {
                    return false;
                }

                return true;
            })
            .build(),
    },
};

@Component({ validations: ValidationHelper.instance.transformRuleset(sliderContainerValidations) })
class SliderContainerComponent extends TsxComponentExtended<SliderContainerArgs> implements SliderContainerArgs {
    @Prop() parentModel: SliderModel;

    mounted() {
        this.prepareValue();
        console.log();
    }

    prepareValue() {
        if (this.parentModel.sliderArray == null) {
            this.parentModel.sliderArray = [];
        }
    }

    getNewSliderItem(): SliderItem {
        return {
            description: new LocalizedText(),
            name: null,
            imageID: null,
            image: null,
        };
    }

    getSliderItemControl(index: number): SliderContainerItemComponent {
        return this.$refs["sliderItem" + index] as SliderContainerItemComponent;
    }

    resetValidation() {
        if (this.parentModel.sliderArray != null) {
            this.parentModel.sliderArray.forEach((item, i) => {
                try {
                    this.getSliderItemControl(i).resetValidation();
                } catch (e) {}
            });
        }

        super.resetValidation();
    }

    validate(showErrorMessage) {
        let valid = super.validate(showErrorMessage);
        if (this.parentModel.sliderArray != null) {
            this.parentModel.sliderArray.forEach((item, i) => {
                var itemResult: boolean;
                try {
                    itemResult = this.getSliderItemControl(i).validate(false);
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

    addNewSliderItem() {
        this.parentModel.sliderArray.push(this.getNewSliderItem());
    }

    removeNewSliderItem(index: number): void {
        this.parentModel.sliderArray.splice(index, 1);
    }

    render(h) {
        console.log(this.parentModel.sliderArray);

        if (this.parentModel.sliderArray == null) {
            return null;
        }

        return (
            <FormItemWrapper label={""} wrap={false}>
                {this.parentModel.sliderArray.map((item, i) => (
                    <SliderContainerItem
                        ref={"sliderItem" + i}
                        key={"sliderItem" + i}
                        sliderItem={item}
                        addNewClicked={() => {
                            this.addNewSliderItem();
                        }}
                        removeClicked={() => {
                            this.removeNewSliderItem(i);
                        }}
                    />
                ))}

                <TextButton
                    icon="icon icon-plus"
                    text={this.resources.add}
                    clicked={() => {
                        this.addNewSliderItem();
                    }}
                />
            </FormItemWrapper>
        );
    }
}

export const SliderContainer = toNative(SliderContainerComponent);

@Component({ validations: ValidationHelper.instance.transformRuleset(sliderContainerItemValidations) })
class SliderContainerItemComponent extends TsxComponentExtended<SliderContainerItemArgs> implements SliderContainerItemArgs {
    @Prop() sliderItem: SliderItem;
    @Prop() addNewClicked: () => void;
    @Prop() removeClicked: () => void;

    imageFile: File = null;

    async imageUploadComplete(e: File) {
        const response = UploadImageHelper.onUploadImage(e);
        this.imageFile = response.file;
        this.sliderItem.image = response.imagePath;

        if (this.imageFile) {
            const resp = await UploadImageHelper.postImage(this.imageFile, ATTRACTION_TYPE.RESORTS);
            this.sliderItem.imageID = resp.file.id;
        }
    }

    render(h) {
        console.log(this.sliderItem);

        return (
            <div>
                <FlexContainer fullWidthOnMobile={true}>
                    <FlexFormItem flexFill={true}>
                        <LocalizedInfoInput
                            wrap={false}
                            label={""}
                            placeholder={AppState.resources.resortSliderTitle}
                            value={this.sliderItem?.name}
                            changed={(e) => (this.sliderItem.name = e)}
                            displayType={"input"}
                            validationState={this.validationStateOf(this.v$.sliderItem.name)}
                            mandatory={true}
                        />
                    </FlexFormItem>
                    <FlexFormItem flexFill={false} width={50}>
                        <div>
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
                    </FlexFormItem>
                </FlexContainer>
                <FlexContainer fullWidthOnMobile={true}>
                    <FlexFormItem flexFill={true}>
                        <LocalizedInfoInput
                            wrap={false}
                            label={""}
                            placeholder={AppState.resources.resortSliderText}
                            value={this.sliderItem?.description}
                            changed={(e) => (this.sliderItem.description = e)}
                            displayType={"input"}
                            validationState={this.validationStateOf(this.v$.sliderItem.description)}
                            mandatory={true}
                        />
                    </FlexFormItem>
                    <FlexFormItem flexFill={false} width={50} />
                </FlexContainer>
                <FlexContainer fullWidthOnMobile={true}>
                    <FlexFormItem>
                        <UploadImage
                            key={"upload-slider-container-image"}
                            ref={"upload-slider-container-image"}
                            aspectRatio={1}
                            useCropper={false}
                            imageCropperTitleMessage={this.resources.resortSliderImageCropperTitleMessage}
                            imagePath={this.sliderItem.image}
                            label={""}
                            imageUploadComplete={(e: File) => this.imageUploadComplete(e)}
                            text={this.resources.resortSliderImageCropperUploadText}
                            mandatory={false}
                            wrap={false}
                            imageWidth={50}
                            inOneRow={true}
                        />
                    </FlexFormItem>
                    <FlexFormItem flexFill={false} width={50} />
                </FlexContainer>
                <hr></hr>
            </div>
        );
    }
}

export const SliderContainerItem = toNative(SliderContainerItemComponent);
