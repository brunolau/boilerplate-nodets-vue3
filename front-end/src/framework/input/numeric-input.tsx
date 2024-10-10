import { toNative, Prop, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import FormItemWrapper, { FormItemWrapperArgs, HintType, MarginType } from "../form/form-item-wrapper";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";
import { InputSpinner } from "bootstrap-input-spinner/src/InputSpinner.js";
import "./css/input-spinner.css";

export const enum NumericInputMode {
    Clasic = "clasic",
    Spinner = "spinner",
}

//TODO: Turn into approperiate types
interface NumericInputArgs extends FormItemWrapperArgs {
    value: number;
    maxValue?: number;
    minValue?: number;
    fullWidth?: boolean;
    step?: number;
    placeholder?: string;
    decimalsAlwaysVisible?: boolean;
    changed: (newValue: number) => void;
    mode?: NumericInputMode;
}

@Component
class NumericInput extends TsxComponent<NumericInputArgs> implements NumericInputArgs {
    @Prop() label!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() subtitle!: string;
    @Prop() value!: number;
    @Prop() mandatory!: boolean;
    @Prop() placeholder!: string;
    @Prop() changed!: (newValue: number) => void;
    @Prop() maxValue!: number;
    @Prop() minValue!: number;
    @Prop() fullWidth!: boolean;
    @Prop() wrap!: boolean;
    @Prop() step!: number;
    @Prop() hint: string;
    @Prop() hintType: HintType;
    @Prop() marginType?: MarginType;
    @Prop() maxWidth?: number;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    @Prop() decimalsAlwaysVisible!: boolean;
    @Prop() mode: NumericInputMode;

    currentValue: number = this.value;

    raiseChangeEvent(e) {
        this.populateValidationDeclaration();

        if (this.changed != null) {
            var newValue = e.target.value;
            if (newValue != null) {
                try {
                    newValue = Number(newValue);
                    if (isNaN(newValue)) {
                        newValue = null;
                    }
                } catch (e) {
                    newValue = null;
                }
            }

            this.currentValue = newValue;
            this.changed(newValue);
        }
    }

    onClassicInput(e) {
        if (this.decimalsAlwaysVisible == true) {
            let value = parseFloat(e.value);
            let decimals = this.getDecimals();

            if (decimals > 0 && !isNaN(value)) {
                (this.$el as HTMLElement).querySelector("input").value = value.toFixed(decimals);
            }
        }
    }

    getMode(): NumericInputMode {
        if (this.mode != null) {
            return this.mode;
        } else {
            return NumericInputMode.Spinner;
        }
    }

    getDecimals(): number {
        if (this.step != null) {
            var step: string = String(this.step);
            var dec = step.split(".", 2)[1]?.length;
            return dec || 0;
        } else {
            return 0;
        }
    }

    render(h) {
        var mode = this.getMode();
        if (mode == NumericInputMode.Clasic) {
            let inputValue = this.currentValue;
            if (this.decimalsAlwaysVisible == true && inputValue != null) {
                inputValue = inputValue.toFixed(this.getDecimals()) as any;
            }

            return (
                <FormItemWrapper
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
                    <input
                        type="number"
                        max={this.maxValue}
                        min={this.minValue}
                        step={this.step}
                        value={inputValue}
                        onChange={(e) => this.raiseChangeEvent(e)}
                        onInput={(e) => this.onClassicInput(e)}
                        class="form-control maxwidth-input"
                        placeholder={this.placeholder}
                    />
                </FormItemWrapper>
            );
        } else {
            var decimals = this.getDecimals();
            return (
                <FormItemWrapper
                    label={this.label}
                    mandatory={this.mandatory}
                    wrap={this.wrap}
                    appendIcon={this.appendIcon}
                    prependIcon={this.prependIcon}
                    hint={this.hint}
                    hintType={HintType.Label}
                    appendClicked={this.appendClicked}
                    prependClicked={this.prependClicked}
                    marginType={this.marginType}
                    maxWidth={this.maxWidth}
                    validationState={this.validationState}
                    labelButtons={this.labelButtons}
                    subtitle={this.subtitle}
                >
                    <div class={"input-spinner-wrap" + (this.fullWidth == true ? " input-spinner-fullwidth" : "")}>
                        <input
                            type="number"
                            min={this.minValue}
                            max={this.maxValue}
                            step={this.step}
                            value={this.currentValue}
                            placeholder={this.placeholder}
                            onChange={(e) => this.raiseChangeEvent(e)}
                            onInput={(e) => this.raiseChangeEvent(e)}
                            class="form-control maxwidth-input input-spinner"
                            data-decimals={decimals}
                        />
                    </div>
                </FormItemWrapper>
            );
        }
    }

    mounted() {
        this.currentValue = this.value;

        var mode = this.getMode();
        if (mode == NumericInputMode.Spinner) {
            new InputSpinner(this.$el.querySelector("input"));
        }
    }

    @Watch("value")
    updateValue() {
        this.currentValue = this.value;
    }

    updated() {
        const newValue = this.currentValue;

        $(this.$el)
            .find("input")
            .each(function (this: any) {
                $(this).val(newValue);
            });
    }
}

export default toNative(NumericInput);
