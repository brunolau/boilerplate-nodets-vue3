function ValidationBuilder(): IValidationArgsBuilder {
    return new window["_ValidationArgsBuilder"]();
}

class ValidationHelper {
    static get instance(): IValidationHelper {
        return window["_ValidationHelper"];
    }
}

window["ValidationBuilder"] = ValidationBuilder;
window["ValidationHelper"] = ValidationHelper;
