import { Prop, toNative } from "vue-facing-decorator";
import { DAY } from "../../api/data-contracts/enums";
import OpeningHours, { OpeningHoursTimeRange } from "../../api/data-contracts/opening-hours";
import { TsxComponentExtended } from "../../app/vuestsx-extended";
import Button from "../../framework/button/button";
import { ButtonLayout, ButtonSize } from "../../framework/button/button-layout";
import FlexContainer from "../../framework/form/flex-container";
import FlexFormItem from "../../framework/form/form-item-flex";
import FormItemWrapper from "../../framework/form/form-item-wrapper";
import TextBox, { TextBoxTextType } from "../../framework/input/textbox";
import DayTranslator from "../../utils/enum-translation/day-translator";
import { timeRegex } from "../../utils/regex";
import { Component } from "../../app/vuetsx";

interface OpeningHoursEditorArgs {
    value: OpeningHours[];
    label?: string;
    validationState?: ValidationState;
    wrap?: boolean;
    isOptional?: boolean;
}

interface OpeningHoursDayArgs {
    value: OpeningHours;
    label: string;
    allowMoreTimes: boolean;
    causesValidation: boolean;
    isOptional?: boolean;
    fromChanged?: () => void;
    toChanged?: () => void;
    reset?: () => void;
}

interface OpeningHoursTimerangeArgs {
    value: OpeningHoursTimeRange;
    isFirst: boolean;
    allowMoreTimes: boolean;
    causesValidation: boolean;
    isOptional?: boolean;
    addNewClicked: () => void;
    removeClicked: () => void;
    fromChanged?: () => void;
    toChanged?: () => void;
    reset?: () => void;
}

const rootValidations: ValidationRuleset<OpeningHoursEditor> = {
    value: ValidationBuilder().required().build(),
};

const dayValidations: ValidationRuleset<OpeningHoursDay> = {
    value: ValidationBuilder().required().build(),
};

const timeRangeValidations: ValidationRuleset<OpeningHoursTimeRangeEditor> = {
    value: {
        timeFrom: ValidationBuilder()
            .customRule("time_from", function (this: OpeningHoursTimeRangeEditor) {
                if (this.$props.isOptional == true) {
                    if (!timeRegex.test(this.value.timeFrom) && !isNullOrEmpty(this.value.timeFrom)) {
                        return false;
                    }

                    return true;
                } else {
                    if (isNullOrEmpty(this.value.timeFrom)) {
                        return false;
                    }

                    if (!timeRegex.test(this.value.timeFrom)) {
                        return false;
                    }

                    return true;
                }
            })
            .build(),
        timeTo: ValidationBuilder()
            .customRule("time_to", function (this: OpeningHoursTimeRangeEditor) {
                if (this.$props.isOptional == true) {
                    if (!timeRegex.test(this.value.timeTo) && !isNullOrEmpty(this.value.timeTo)) {
                        return false;
                    }

                    return true;
                } else {
                    if (isNullOrEmpty(this.value.timeTo)) {
                        return false;
                    }

                    if (!timeRegex.test(this.value.timeTo)) {
                        return false;
                    }

                    return true;
                }
            })
            .build(),
    },
};

@Component({ validations: ValidationHelper.instance.transformRuleset(rootValidations) })
class OpeningHoursEditor extends TsxComponentExtended<OpeningHoursEditorArgs> implements OpeningHoursEditorArgs {
    @Prop() value: OpeningHours[];
    @Prop() label!: string;
    @Prop() wrap!: boolean;
    @Prop() isOptional: boolean;
    bulkChangeHours: OpeningHours = null;

    mounted() {
        this.prepareValue();
    }

    updated() {
        this.prepareValue();
    }

    reset() {
        this.resetBulkChangeHours();
    }

    resetBulkChangeHours() {
        this.bulkChangeHours = {
            day: null,
            timeRanges: [{ timeFrom: null, timeTo: null }],
        };
    }

    prepareValue() {
        if (this.bulkChangeHours == null) {
            this.resetBulkChangeHours();
        }

        if (this.value != null && this.value.length < 7) {
            if (this.value.length == 0) {
                this.value.push({
                    day: DAY.MONDAY,
                    timeRanges: [{ timeFrom: null, timeTo: null }],
                });
            }

            while (this.value.length < 7) {
                this.value.push(JSON.parse(JSON.stringify(this.value[0])));
            }

            for (let i = 0, len = this.value.length; i < len; i++) {
                let day: DAY = null;
                if (i == 0) {
                    day = DAY.MONDAY;
                } else if (i == 1) {
                    day = DAY.TUESDAY;
                } else if (i == 2) {
                    day = DAY.WEDNESDAY;
                } else if (i == 3) {
                    day = DAY.THURSDAY;
                } else if (i == 4) {
                    day = DAY.FRIDAY;
                } else if (i == 5) {
                    day = DAY.SATURDAY;
                } else {
                    day = DAY.SUNDAY;
                }

                this.value[i].day = day;
            }
        }
    }

    getCurrentNonNullValues(nullIfEmpty?: boolean): OpeningHours[] {
        const respArr: OpeningHours[] = [];
        if (!isNullOrEmpty(this.value)) {
            for (const dayVal of this.value) {
                for (const dayRecord of dayVal.timeRanges) {
                    if (!isNullOrEmpty(dayRecord.timeFrom) && !isNullOrEmpty(dayRecord.timeTo)) {
                        respArr.push(dayVal);
                        break;
                    }
                }
            }
        }

        if (isNullOrEmpty(respArr) && nullIfEmpty == true) {
            return null;
        }

        return respArr;
    }

    getItemControl(index: number): OpeningHoursDay {
        return this.$refs["openingHoursItem" + index] as OpeningHoursDay;
    }

    resetValidation() {
        if (this.value != null) {
            this.value.forEach((oh, i) => {
                try {
                    this.getItemControl(i).resetValidation();
                } catch (e) {}
            });
        }

        super.resetValidation();
    }

    validate(showErrorMessage?: boolean): boolean {
        let valid = super.validate(showErrorMessage);
        if (!valid) {
            return false;
        }

        if (this.value != null) {
            this.value.forEach((td, i) => {
                var itemResult: boolean;
                try {
                    itemResult = this.getItemControl(i).validate(false);
                } catch (e) {
                    itemResult = true;
                }

                if (itemResult == false) {
                    valid = false;
                }
            });
        }

        if (!valid && showErrorMessage != false) {
            this.showValidationErrorMessage();
        }

        return valid;
    }

    getDayLabel(openingHours: OpeningHours): string {
        return DayTranslator.getString(openingHours.day);
    }

    onBulkFromChanged() {
        let newValue = this.bulkChangeHours.timeRanges[0].timeFrom;
        this.value.forEach((val) => {
            if (val.timeRanges.length > 1) {
                val.timeRanges = [val.timeRanges[0]];
            }

            val.timeRanges[0].timeFrom = newValue;
        });
    }

    onBulkToChanged() {
        let newValue = this.bulkChangeHours.timeRanges[0].timeTo;
        this.value.forEach((val) => {
            if (val.timeRanges.length > 1) {
                val.timeRanges = [val.timeRanges[0]];
            }

            val.timeRanges[0].timeTo = newValue;
        });
    }

    onBulkReset() {
        this.value?.forEach((val) => {
            val?.timeRanges?.forEach((timeRange) => {
                timeRange.timeFrom = null;
                timeRange.timeTo = null;
            });
        });
    }

    render(h) {
        return (
            <div class="opening-hours-editor-root">
                <OpeningHoursDay
                    label={""}
                    allowMoreTimes={false}
                    causesValidation={false}
                    isOptional={true}
                    value={this.bulkChangeHours}
                    fromChanged={() => {
                        this.onBulkFromChanged();
                    }}
                    toChanged={() => {
                        this.onBulkToChanged();
                    }}
                    reset={() => {
                        this.onBulkReset();
                    }}
                />

                {this.value != null &&
                    this.value.map((openingHours, i) => (
                        <OpeningHoursDay
                            ref={"openingHoursItem" + i}
                            label={this.getDayLabel(openingHours)}
                            allowMoreTimes={true}
                            causesValidation={true}
                            isOptional={this.isOptional}
                            value={openingHours}
                        />
                    ))}
            </div>
        );
    }
}

@Component({ validations: ValidationHelper.instance.transformRuleset(dayValidations) })
class OpeningHoursDay extends TsxComponentExtended<OpeningHoursDayArgs> implements OpeningHoursDayArgs {
    @Prop() value: OpeningHours;
    @Prop() label: string;
    @Prop() allowMoreTimes: boolean;
    @Prop() causesValidation: boolean;
    @Prop() isOptional: boolean;
    @Prop() fromChanged?: () => void;
    @Prop() toChanged?: () => void;
    @Prop() reset: () => void;

    getItemControl(index: number): OpeningHoursTimeRangeEditor {
        return this.$refs["timeRangeItem" + index] as OpeningHoursTimeRangeEditor;
    }

    resetValidation() {
        if (this.value?.timeRanges != null) {
            this.value.timeRanges.forEach((tr, i) => {
                try {
                    this.getItemControl(i).resetValidation();
                } catch (e) {}
            });
        }

        super.resetValidation();
    }

    validate(showErrorMessage) {
        let valid = super.validate(showErrorMessage);
        if (this.value?.timeRanges != null) {
            this.value.timeRanges.forEach((tr, i) => {
                var itemResult: boolean;
                try {
                    itemResult = this.getItemControl(i).validate(false);
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

    addNewTimerange() {
        this.value.timeRanges.push({
            timeFrom: null,
            timeTo: null,
        });
    }

    removeTimerange(timeRage: OpeningHoursTimeRange): void {
        this.value.timeRanges.remove(timeRage);
    }

    render(h) {
        if (this.value == null) {
            return null;
        }

        if (this.value.timeRanges == null) {
            this.value.timeRanges = [];
        }

        return (
            <FormItemWrapper label={this.label}>
                {this.value.timeRanges.map((timeRange, i) => (
                    <OpeningHoursTimeRangeEditor
                        ref={"timeRangeItem" + i}
                        value={timeRange}
                        isFirst={i == 0}
                        allowMoreTimes={this.allowMoreTimes}
                        causesValidation={this.causesValidation}
                        isOptional={this.isOptional}
                        addNewClicked={() => {
                            this.addNewTimerange();
                        }}
                        removeClicked={() => {
                            this.removeTimerange(timeRange);
                        }}
                        toChanged={this.toChanged}
                        fromChanged={this.fromChanged}
                        reset={this.reset}
                    />
                ))}

                {isNullOrEmpty(this.value.timeRanges) && (
                    <FlexContainer fullWidthOnMobile={true}>
                        <FlexFormItem flexFill={true}>{this.resources.statusClosed}</FlexFormItem>

                        <FlexFormItem flexFill={false} width={100}>
                            <Button
                                layout={ButtonLayout.Default}
                                outlined={true}
                                size={ButtonSize.Small}
                                iconButton={true}
                                icon="icon icon-plus"
                                clicked={() => {
                                    this.addNewTimerange();
                                }}
                            />
                        </FlexFormItem>
                    </FlexContainer>
                )}
            </FormItemWrapper>
        );
    }
}

@Component({ validations: ValidationHelper.instance.transformRuleset(timeRangeValidations) })
class OpeningHoursTimeRangeEditor extends TsxComponentExtended<OpeningHoursTimerangeArgs> implements OpeningHoursTimerangeArgs {
    @Prop() value: OpeningHoursTimeRange;
    @Prop() isFirst: boolean;
    @Prop() allowMoreTimes: boolean;
    @Prop() causesValidation: boolean;
    @Prop() isOptional: boolean;
    @Prop() addNewClicked: () => void;
    @Prop() removeClicked: () => void;
    @Prop() fromChanged?: () => void;
    @Prop() toChanged?: () => void;
    @Prop() reset: () => void;

    onFromChanged(newValue: string) {
        this.value.timeFrom = newValue;

        if (this.fromChanged != null) {
            this.fromChanged();
        }
    }

    onToChanged(newValue: string) {
        this.value.timeTo = newValue;

        if (this.toChanged != null) {
            this.toChanged();
        }
    }

    onBulkReset() {
        this.resetValue();

        if (this.reset != null) {
            this.reset();
        }
    }

    resetValue() {
        this.value.timeFrom = null;
        this.value.timeTo = null;
    }

    render(h) {
        return (
            <FlexContainer fullWidthOnMobile={true}>
                <FlexFormItem flexFill={true}>
                    <TextBox
                        wrap={false}
                        mandatory={true}
                        placeholder={"Opens at"}
                        label={null}
                        value={this.value.timeFrom}
                        textType={TextBoxTextType.Time}
                        validationState={this.causesValidation == false ? null : this.validationStateOf(this.v$.value.timeFrom)}
                        changed={(e) => {
                            this.onFromChanged(e);
                        }}
                    />
                </FlexFormItem>
                <FlexFormItem flexFill={true}>
                    <TextBox
                        wrap={false}
                        mandatory={true}
                        placeholder={"Closes at"}
                        label={null}
                        value={this.value.timeTo}
                        textType={TextBoxTextType.Time}
                        validationState={this.causesValidation == false ? null : this.validationStateOf(this.v$.value.timeTo)}
                        changed={(e) => {
                            this.onToChanged(e);
                        }}
                    />
                </FlexFormItem>

                <FlexFormItem flexFill={false} width={100}>
                    {this.allowMoreTimes && (
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
                    )}
                    {!this.allowMoreTimes && <Button layout={ButtonLayout.Danger} outlined={true} size={ButtonSize.Small} iconButton={true} icon="icon icon-close" clicked={this.onBulkReset} />}
                </FlexFormItem>
            </FlexContainer>
        );
    }
}

export default toNative(OpeningHoursEditor);
