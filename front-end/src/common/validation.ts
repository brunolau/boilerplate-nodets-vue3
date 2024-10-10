import {
    required,
    minLength,
    maxLength,
    minValue,
    maxValue,
    between,
    requiredIf,
    requiredUnless,
    alpha,
    alphaNum,
    numeric,
    integer,
    decimal,
    email,
    ipAddress,
    macAddress,
    sameAs,
    url,
    helpers,
} from "@vuelidate/validators";
import { ViewModelBase } from "./base-component";
import { Validation } from "@vuelidate/core";

function getFirstUnsattisfiedValidatorName(valProp: Validation): string {
    for (var validatorName in valProp.$params) {
        if (valProp[validatorName] === false) {
            return validatorName;
        }
    }

    return null;
}

function getErrorMessage(valProp: Validation, invalidValidatorName: string): string {
    if (invalidValidatorName == null) {
        return null;
    }

    if (invalidValidatorName == "requiredIf" || invalidValidatorName == "requiredLocalizedString") {
        invalidValidatorName = "required";
    }

    var errMsg = AppState.resources["validationError" + invalidValidatorName.capitalize()];
    switch (invalidValidatorName) {
        case "minLength":
        case "minValue":
            errMsg = errMsg.format(valProp.$params[invalidValidatorName]["min"]);
            break;

        case "maxLength":
        case "maxValue":
            errMsg = errMsg.format(valProp.$params[invalidValidatorName]["max"]);
            break;

        case "between":
            errMsg = errMsg.format(valProp.$params[invalidValidatorName]["min"], valProp.$params[invalidValidatorName]["max"]);
            break;

        default:
    }

    if (isNullOrEmpty(errMsg)) {
        errMsg = AppState.resources.validationErrorGeneric;
    }

    if (valProp.$params.customErrMsg) {
        errMsg = valProp.$params.customErrMsg.errMsg;
    }

    return errMsg;
}

class ValidationHelper implements IValidationHelper {
    getValidationDisplayState(valProp: Validation, includeDirty: boolean): ValidationState {
        var errMsg: string;
        var invalidValidatorName: string;

        if (valProp.$invalid && (includeDirty || valProp["_changed"] == true)) {
            invalidValidatorName = getFirstUnsattisfiedValidatorName(valProp);
            errMsg = getErrorMessage(valProp, invalidValidatorName);
        }

        return {
            mandatory: valProp["required"] != null,
            valid: invalidValidatorName == null,
            validationDeclaration: valProp,
            errorMessage: errMsg,
        };
    }

    resetValidation(viewModel: ViewModelBase): void {
        let $v = viewModel.v$;
        let recIterate = function (obj) {
            for (let key in obj) {
                if (!key.startsWith("$")) {
                    let objItem = obj[key];
                    if (objItem != null) {
                        if (Object.getPrototypeOf(objItem) === Object.prototype) {
                            recIterate(objItem);
                        }

                        if (objItem["_changed"] == true) {
                            objItem["_changed"] = false;
                        }
                    }
                }
            }

            if (obj["$reset"]) {
                obj.$reset();
            }

            if (obj["_changed"] == true) {
                obj["_changed"] = false;
            }
        };

        if ($v != null) {
            try {
                $v.value.$reset();
            } catch (e) {}

            try {
                recIterate($v);
            } catch (e) {}
        }

        viewModel.$forceUpdate();
    }

    transformRuleset<T>(ruleSet: ValidationRuleset<T>): any {
        return ruleSet as any;
    }
}

export class ValidationArgsBuilder implements IValidationArgsBuilder {
    private _validationArgs: any = {};

    static get() {
        return new ValidationArgsBuilder();
    }

    build(): IValidationSet {
        return this._validationArgs as any;
    }

    required(): ValidationArgsBuilder {
        this._validationArgs.required = required;
        return this;
    }

    requiredIf?(field: string | ((vm: any, parentVm?: ViewModelBase) => any)): ValidationArgsBuilder {
        this._validationArgs.requiredIf = requiredIf(field as string);
        return this;
    }

    requiredLocalizedString(): ValidationArgsBuilder {
        this._validationArgs.requiredLocalizedString = (value) => {
            if (value == null || isNullOrEmpty(LocalizedStringHelper.getValue(value, 0))) {
                return false;
            }

            return true;
        };

        return this;
    }

    requiredUnless?(field: string | ((vm: any, parentVm?: ViewModelBase) => any)): ValidationArgsBuilder {
        this._validationArgs.requiredUnless = requiredUnless(field as string);
        return this;
    }

    minLength(length: number): ValidationArgsBuilder {
        this._validationArgs.minLength = minLength(length);
        return this;
    }

    maxLength(length: number): ValidationArgsBuilder {
        this._validationArgs.maxLength = maxLength(length);
        return this;
    }

    minValue(length: number): ValidationArgsBuilder {
        this._validationArgs.minValue = minValue(length);
        return this;
    }

    maxValue(length: number): ValidationArgsBuilder {
        this._validationArgs.maxValue = maxValue(length);
        return this;
    }

    between(min: number, max: number): ValidationArgsBuilder {
        this._validationArgs.between = between(min, max);
        return this;
    }

    alpha(): ValidationArgsBuilder {
        this._validationArgs.alpha = alpha;
        return this;
    }

    alphaNum(): ValidationArgsBuilder {
        this._validationArgs.alphaNum = alphaNum;
        return this;
    }

    numeric(): ValidationArgsBuilder {
        this._validationArgs.numeric = numeric;
        return this;
    }

    integer(): ValidationArgsBuilder {
        this._validationArgs.integer = integer;
        return this;
    }

    decimal(): ValidationArgsBuilder {
        this._validationArgs.decimal = decimal;
        return this;
    }

    email(): ValidationArgsBuilder {
        this._validationArgs.email = email;
        return this;
    }

    ipAddress(): ValidationArgsBuilder {
        this._validationArgs.ipAddress = ipAddress;
        return this;
    }

    macAddress(): ValidationArgsBuilder {
        this._validationArgs.macAddress = macAddress;
        return this;
    }

    sameAs(field: string | ((vm: any, parentVm?: ViewModelBase) => any)): ValidationArgsBuilder {
        this._validationArgs.sameAs = sameAs(field);
        return this;
    }

    url(): ValidationArgsBuilder {
        this._validationArgs.url = url;
        return this;
    }

    customRule(name: string, validationFunc: (value: string) => boolean): ValidationArgsBuilder {
        this._validationArgs[name] = validationFunc;
        return this;
    }

    withCustomErrorMessage(msg: string): ValidationArgsBuilder {
        this._validationArgs["customErrMsg"] = helpers.withParams({ type: "customErrMsg", errMsg: msg }, function (value, parentVm) {
            return true;
        });

        return this;
    }
}

window["_ValidationHelper"] = new ValidationHelper();
window["_ValidationArgsBuilder"] = ValidationArgsBuilder;
