import { toNative, Prop, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import FormItemWrapper, { FormItemWrapperArgs, MarginType } from "../form/form-item-wrapper";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";

interface TextBoxArgs extends FormItemWrapperArgs {
    value: string;
    placeholder?: string;
    textType?: TextBoxTextType;
    disabled?: boolean;
    autoCompleteEnabled?: boolean;
    changed: (newValue: string) => void;
    maxLength?: number;
    updateMode?: "input" | "change";
    nameAttr?: string;
    keyDown?: (e: KeyboardEvent) => void;
    enterPressed?: (e: KeyboardEvent) => void;
}

export const enum TextBoxTextType {
    Text = "text",
    Password = "password",
    Url = "url",
    Email = "email",
    Time = "time",
    Phone = "phone",
}

@Component
class TextBox extends TsxComponent<TextBoxArgs> implements TextBoxArgs {
    @Prop() label!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() subtitle!: string;
    @Prop() value!: string;
    @Prop() placeholder!: string;
    @Prop() cssClass!: string;
    @Prop() mandatory!: boolean;
    @Prop() disabled!: boolean;
    @Prop() wrap!: boolean;
    @Prop() hint: string;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() maxWidth?: number;
    @Prop() nameAttr?: string;
    @Prop() marginType?: MarginType;
    @Prop() textType: TextBoxTextType;
    @Prop() autoCompleteEnabled: boolean;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    @Prop() keyDown: (e: KeyboardEvent) => void;
    @Prop() enterPressed: (e: KeyboardEvent) => void;
    @Prop() changed: (newValue: string) => void;
    @Prop() updateMode?: "input" | "change";
    @Prop() maxLength: number;

    currentValue: string = this.value;

    mounted() {
        this.currentValue = this.value;
        if (this.keyDown != null || this.enterPressed != null) {
            this.$el.querySelector("input").addEventListener("keydown", (e) => {
                this.keyDownHandler(e);
            });
        }
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

    getTypeAttribute(): string {
        return this.textType || "text";
    }

    getAutoCompleteText(): string {
        if (this.autoCompleteEnabled == false) {
            if (portalUtils.isBrowserChrome()) {
                return "new-password";
            } else {
                return "off";
            }
        }

        return null;
    }

    keyDownHandler(e: KeyboardEvent) {
        if (this.keyDown != null) {
            this.keyDown(e);
        }

        if (this.enterPressed != null && (e.keyCode == 13 || e.which == 13)) {
            this.raiseChangeEvent(e);
            this.enterPressed(e);
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }
    }

    render(h) {
        return (
            <FormItemWrapper
                label={this.label}
                cssClass={this.cssClass}
                mandatory={this.mandatory}
                wrap={this.wrap}
                appendIcon={this.appendIcon}
                prependIcon={this.prependIcon}
                hint={this.hint}
                marginType={this.marginType}
                appendClicked={this.appendClicked}
                prependClicked={this.prependClicked}
                maxWidth={this.maxWidth}
                validationState={this.validationState}
                labelButtons={this.labelButtons}
                subtitle={this.subtitle}
            >
                <input
                    type={this.getTypeAttribute()}
                    disabled={(this.disabled as any) != true ? null : "disabled"}
                    value={this.currentValue}
                    maxlength={this.maxLength}
                    name={this.nameAttr}
                    onChange={(e) => this.raiseChangeEvent(e)}
                    onInput={(e) => {
                        if (this.updateMode == "input") {
                            this.raiseChangeEvent(e);
                        }
                    }}
                    class="form-control maxwidth-input"
                    placeholder={this.placeholder}
                    autocomplete={this.getAutoCompleteText()}
                />
            </FormItemWrapper>
        );
    }
}

export default toNative(TextBox);
