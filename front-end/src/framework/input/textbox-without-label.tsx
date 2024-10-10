import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { TextBoxTextType } from "./textbox";

interface TextBoxWithoutLabelArgs {
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

@Component
class TextBoxWithoutLabel extends TsxComponent<TextBoxWithoutLabelArgs> implements TextBoxWithoutLabelArgs {
    @Prop() value: string;
    @Prop() placeholder!: string;
    @Prop() cssClass!: string;
    @Prop() disabled!: boolean;
    @Prop() nameAttr?: string;
    @Prop() textType: TextBoxTextType;
    @Prop() autoCompleteEnabled: boolean;
    @Prop() keyDown: (e: KeyboardEvent) => void;
    @Prop() enterPressed: (e: KeyboardEvent) => void;
    @Prop() changed: (newValue: string) => void;
    @Prop() updateMode?: "input" | "change";
    @Prop() maxLength: number;

    fieldValue: string = null;

    mounted() {
        this.fieldValue = this.value;
        if (this.keyDown != null || this.enterPressed != null) {
            this.$el.addEventListener("keydown", (e) => {
                (this as any).keyDownHandler(e);
            });
        }
    }

    raiseChangeEvent(e) {
        this.populateValidationDeclaration();

        if (this.changed != null) {
            var newValue = e.target.value;
            this.fieldValue = newValue;
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
            <input
                type={this.getTypeAttribute()}
                disabled={(this.disabled as any) != true ? null : "disabled"}
                value={this.fieldValue}
                maxlength={this.maxLength}
                name={this.nameAttr}
                onChange={(e) => this.raiseChangeEvent(e)}
                onInput={(e) => {
                    if (this.updateMode == "input") {
                        this.raiseChangeEvent(e);
                    }
                }}
                class={"form-control maxwidth-input " + this.cssClass}
                placeholder={this.placeholder}
                autocomplete={this.getAutoCompleteText()}
            />
        );
    }
}

export default toNative(TextBoxWithoutLabel);
