import { Prop, toNative, Watch } from "vue-facing-decorator";
import { TsxComponentExtended } from "../../app/vuestsx-extended";
import Button from "../../framework/button/button";
import { ButtonLayout, ButtonSize } from "../../framework/button/button-layout";
import FlexContainer from "../../framework/form/flex-container";
import FlexFormItem from "../../framework/form/form-item-flex";
import FormItemWrapper from "../../framework/form/form-item-wrapper";
import TextBox, { TextBoxTextType } from "../../framework/input/textbox";
import { Component } from "../../app/vuetsx";

export interface VideoUrls {
    videoUrls: string[];
}

interface VideoUrlContainerArgs {
    videoModel: VideoUrls;
    label?: string;
}

interface VideoUrlItemArgs {
    value: string;
    isFirst: boolean;
    addNewClicked: () => void;
    removeClicked: () => void;
    changed: (newValue: string) => void;
}

const videoUrlsValidations: ValidationRuleset<VideoUrlsContainerComponent> = {
    videoModel: ValidationBuilder().required().build(),
};

const videoUrlItemValidations: ValidationRuleset<VideoUrlItemComponent> = {
    value: ValidationBuilder().url().build(),
};

@Component({ validations: ValidationHelper.instance.transformRuleset(videoUrlsValidations) })
class VideoUrlsContainerComponent extends TsxComponentExtended<VideoUrlContainerArgs> implements VideoUrlContainerArgs {
    @Prop() label?: string;
    @Prop() videoModel: VideoUrls;

    mounted() {
        this.prepareValue();
    }

    prepareValue() {
        if (this.videoModel.videoUrls == null) {
            this.videoModel.videoUrls = [];
        }

        if (this.videoModel.videoUrls.length == 0) {
            this.videoModel.videoUrls.push(null);
        }
    }

    getVideoUrlItemControl(index: number): VideoUrlItemComponent {
        return this.$refs["videoUrlItem" + index] as VideoUrlItemComponent;
    }

    resetValidation() {
        if (this.videoModel.videoUrls != null) {
            this.videoModel.videoUrls.forEach((url, i) => {
                try {
                    this.getVideoUrlItemControl(i).resetValidation();
                } catch (e) {}
            });
        }

        super.resetValidation();
    }

    validate(showErrorMessage) {
        let valid = super.validate(showErrorMessage);
        if (this.videoModel.videoUrls != null) {
            this.videoModel.videoUrls.forEach((url, i) => {
                var itemResult: boolean;
                try {
                    itemResult = this.getVideoUrlItemControl(i).validate(false);
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

    addNewVideoUrl() {
        this.videoModel.videoUrls.push(null);
    }

    removeVideoUrl(index: number): void {
        this.videoModel.videoUrls.splice(index, 1);
    }

    render(h) {
        if (this.videoModel.videoUrls == null) {
            return null;
        }

        return (
            <FormItemWrapper label={this.label || this.resources.videoUrlsLabel}>
                {this.videoModel.videoUrls.map((url, i) => (
                    <VideoUrlItem
                        ref={"videoUrlItem" + i}
                        value={url}
                        isFirst={i == 0}
                        addNewClicked={() => {
                            this.addNewVideoUrl();
                        }}
                        removeClicked={() => {
                            this.removeVideoUrl(i);
                        }}
                        changed={(e) => {
                            this.videoModel.videoUrls[i] = e;
                        }}
                    />
                ))}
            </FormItemWrapper>
        );
    }
}

export const VideoUrlsContainer = toNative(VideoUrlsContainerComponent);

@Component({ validations: ValidationHelper.instance.transformRuleset(videoUrlItemValidations) })
class VideoUrlItemComponent extends TsxComponentExtended<VideoUrlItemArgs> implements VideoUrlItemArgs {
    @Prop() value!: string;
    @Prop() isFirst: boolean;
    @Prop() addNewClicked: () => void;
    @Prop() removeClicked: () => void;
    @Prop() changed: (newValue: string) => void;

    currentValue: string = this.value;

    mounted() {
        this.currentValue = this.value;
    }

    @Watch("value")
    updateValue() {
        this.currentValue = this.value;
    }

    onChanged(newValue: string) {
        this.currentValue = newValue;

        if (this.changed != null) {
            this.changed(newValue);
        }
    }

    render(h) {
        return (
            <FlexContainer fullWidthOnMobile={true}>
                <FlexFormItem flexFill={true}>
                    <TextBox
                        wrap={false}
                        mandatory={true}
                        placeholder={this.resources.videoUrlLabelPlaceholder}
                        label={null}
                        value={this.currentValue}
                        textType={TextBoxTextType.Url}
                        validationState={this.validationStateOf(this.v$.value)}
                        changed={(e) => {
                            this.onChanged(e);
                        }}
                    />
                </FlexFormItem>
                <FlexFormItem flexFill={false} width={50}>
                    <div>
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
                    </div>
                </FlexFormItem>
            </FlexContainer>
        );
    }
}

export const VideoUrlItem = toNative(VideoUrlItemComponent);
