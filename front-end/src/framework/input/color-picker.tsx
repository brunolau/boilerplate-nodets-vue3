import { Prop, toNative, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { FormItemWrapperArgs, MarginType } from "../form/form-item-wrapper";
import TextBox from "./textbox";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";
import "jquery-minicolors";
import "../../../node_modules/jquery-minicolors/jquery.minicolors.css";
import "./css/color-picker.css";

interface ColorPickerArgs extends FormItemWrapperArgs {
    value: string;
    placeholder?: string;
    changed: (newValue: string) => void;
}

@Component
class ColorPicker extends TsxComponent<ColorPickerArgs> implements ColorPickerArgs {
    @Prop() label!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() subtitle!: string;
    @Prop() value!: string;
    @Prop() placeholder!: string;
    @Prop() mandatory!: boolean;
    @Prop() wrap!: boolean;
    @Prop() hint: string;
    @Prop() marginType?: MarginType;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;

    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    @Prop() changed: (newValue: string) => void;

    currentValue: string = this.value;

    raiseChangeEvent(e) {
        this.populateValidationDeclaration();

        if (this.changed != null) {
            var newValue = e;
            this.currentValue = newValue;
            this.changed(newValue);
        }
    }

    render(h) {
        return (
            <TextBox
                changed={(e) => this.raiseChangeEvent(e)}
                label={this.label}
                labelButtons={this.labelButtons}
                value={this.currentValue}
                subtitle={this.subtitle}
                placeholder={this.placeholder}
                mandatory={this.mandatory}
                wrap={this.wrap}
                appendIcon={this.appendIcon}
                prependIcon={this.prependIcon}
                hint={this.hint}
                marginType={this.marginType}
                appendClicked={this.appendClicked}
                prependClicked={this.prependClicked}
                validationState={this.validationState}
            />
        );
    }

    mounted() {
        this.currentValue = this.value;
        $(this.$el)
            .find("input")
            ["minicolors"]({
                theme: "bootstrap",
                change: (value, opacity) => {
                    this.raiseChangeEvent(value);
                },
            });
    }

    @Watch("value")
    updateValue() {
        this.currentValue = this.value;
    }

    beforeDestroy() {
        $(this.$el).find("input")["minicolors"]("method", "destroy");
    }
}

export default toNative(ColorPicker);
