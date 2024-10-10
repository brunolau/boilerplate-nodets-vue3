import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";

export interface ValidationResultDisplayerArgs {
    validationState?: ValidationState;
    customValidationMessage?: ((item) => string) | string;
}

@Component
class ValidationResultDisplayer extends TsxComponent<ValidationResultDisplayerArgs> implements ValidationResultDisplayerArgs {
    @Prop() customValidationMessage: (() => string) | string;

    getValidationErrorMessage(): string {
        if (this.customValidationMessage != null) {
            if (this.customValidationMessage.length && this.customValidationMessage.length == 0) {
                return this.validationErrorMessage;
            } else {
                return (this.customValidationMessage as any)(this);
            }
        }

        return this.validationErrorMessage;
    }

    render(h) {
        if (!this.hasValidationError) {
            return null;
        }

        return <div class="invalid-feedback">{this.getValidationErrorMessage()}</div>;
    }
}

export default toNative(ValidationResultDisplayer);
