import { toNative, Prop, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import FormItemWrapper, { FormItemWrapperArgs, MarginType } from "../form/form-item-wrapper";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";

interface TextAreaArgs extends FormItemWrapperArgs {
    value: string;
    placeholder?: string;
    changed: (newValue: string) => void;
    rows: number;
    maxLength?: number;
}

@Component
class TextArea extends TsxComponent<TextAreaArgs> implements TextAreaArgs {
    @Prop() label!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() subtitle!: string;
    @Prop() value!: string;
    @Prop() placeholder!: string;
    @Prop() mandatory!: boolean;
    @Prop() marginType?: MarginType;
    @Prop() maxWidth?: number;
    @Prop() wrap!: boolean;
    @Prop() hint: string;
    @Prop() rows: number;
    @Prop() maxLength: number;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    @Prop() changed: (newValue: string) => void;

    currentValue: string = this.value;

    mounted() {
        this.currentValue = this.value;
    }

    @Watch("value")
    updateValue() {
        this.currentValue = this.value;
    }

    raiseChangeEvent(e) {
        this.populateValidationDeclaration();

        if (this.changed != null) {
            var newValue = e.target.value;
            this.currentValue = newValue;
            this.changed(newValue);
        }
    }

    render(h) {
        return (
            <FormItemWrapper
                label={this.label}
                mandatory={this.mandatory}
                wrap={this.wrap}
                appendIcon={this.appendIcon}
                prependIcon={this.prependIcon}
                hint={this.hint}
                appendClicked={this.appendClicked}
                marginType={this.marginType}
                prependClicked={this.prependClicked}
                maxWidth={this.maxWidth}
                validationState={this.validationState}
                labelButtons={this.labelButtons}
                subtitle={this.subtitle}
            >
                <textarea
                    value={this.currentValue}
                    onChange={(e) => this.raiseChangeEvent(e)}
                    class="form-control maxwidth-input"
                    placeholder={this.placeholder}
                    maxlength={this.maxLength}
                    rows={this.rows}
                />
            </FormItemWrapper>
        );
    }
}

export default toNative(TextArea);
