import { Validation } from "@vuelidate/core";
import { ViewModelBase } from "../../base-component";
import { ComponentSetupFunction, Cons } from "vue-facing-decorator/dist/component";
import { ComponentCustomOptions, MethodOptions } from "vue";

type ValidationRulesetBase<T> = {
    [Key in keyof T]?: T[Key] extends Array<any> ? ValidationRulesetBase<T[Key][0]> : T[Key] extends object ? ValidationRulesetBase<T[Key]> : IValidationSet;
};

interface ValidationRulesetExtension {
    _validationDeclaration?: IValidationSet;
}

declare global {
    interface IValidation extends Validation {}

    interface IValidationArgsBuilder {
        build(): any;
        required(): IValidationArgsBuilder;
        requiredIf?(field: string | ((vm: any, parentVm?: ViewModelBase) => any)): IValidationArgsBuilder;
        requiredLocalizedString(): IValidationArgsBuilder;
        requiredUnless?(field: string | ((vm: any, parentVm?: ViewModelBase) => any)): IValidationArgsBuilder;
        minLength(length: number): IValidationArgsBuilder;
        maxLength(length: number): IValidationArgsBuilder;
        minValue(length: number): IValidationArgsBuilder;
        maxValue(length: number): IValidationArgsBuilder;
        between(min: number, max: number): IValidationArgsBuilder;
        alpha(): IValidationArgsBuilder;
        alphaNum(): IValidationArgsBuilder;
        numeric(): IValidationArgsBuilder;
        integer(): IValidationArgsBuilder;
        decimal(): IValidationArgsBuilder;
        email(): IValidationArgsBuilder;
        ipAddress(): IValidationArgsBuilder;
        macAddress(): IValidationArgsBuilder;
        sameAs(field: string | ((vm: any, parentVm?: ViewModelBase) => any)): IValidationArgsBuilder;
        url(): IValidationArgsBuilder;
        customRule(name: string, validationFunc: (value: string) => boolean): IValidationArgsBuilder;
    }

    interface ValidationState {
        valid: boolean;
        mandatory: boolean;
        errorMessage: string;
        validationDeclaration: IValidation;
    }

    interface IValidationHelper {
        resetValidation(viewModel: ViewModelBase): void;
        getValidationDisplayState(valProp: IValidation, includeDirty: boolean): ValidationState;
        transformRuleset<T>(ruleSet: any): any;
    }

    interface IValidationSet {
        _validationSet: boolean;
    }

    type ValidationRuleset<T> = ValidationRulesetBase<T> | ValidationRulesetExtension;
}

declare module "vue-facing-decorator" {
    type GroupDecl = string[];
    type AsyncDecl = (...args: any[]) => boolean | Promise<boolean>;
    type NestedDecl = RuleDecl;
    type DynamicDecl = () => RuleDecl;
    interface RuleDecl {
        [rule: string]: GroupDecl | AsyncDecl | NestedDecl;
    }

    type ComponentOption = {
        name?: string;
        emits?: string[];
        provide?: Record<string, any> | Function;
        components?: Record<string, any>;
        directives?: Record<string, any>;
        inheritAttrs?: boolean;
        expose?: string[];
        render?: Function;
        modifier?: (raw: any) => any;
        options?: ComponentCustomOptions & Record<string, any>;
        template?: string;
        mixins?: any[];
        setup?: ComponentSetupFunction;
        methods?: MethodOptions;
    };

    type ComponentConsOption = Cons | ComponentOption;
}

// declare module "vue/types/vue" {
//     type ValidationProperties<V> = {
//         [P in Exclude<keyof V, "$v">]?: ValidationExt & ValidationProperties<V[P]> & ValidationEvaluation;
//     };

//     interface ValidationExt extends Vue {
//         $model: any;
//         // const validationGetters
//         readonly $invalid: boolean;
//         readonly $dirty: boolean;
//         readonly $anyDirty: boolean;
//         readonly $error: boolean;
//         readonly $anyError: boolean;
//         readonly $pending: boolean;
//         readonly $params: { [attr: string]: any };

//         // const validationMethods
//         $touch(): void;
//         $reset(): void;
//     }

//     interface ValidationEvaluation {
//         [ruleName: string]: boolean;
//     }

//     interface Vue {
//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         // @ts-ignore
//         $v: ValidationProperties<this> & ValidationExt;
//     }
// }

// declare module "vue/types/options" {
//     interface ValidGroupDecl {
//         [group: string]: string[];
//     }

//     interface ValidPropertyDecl {
//         [prop: string]: RuleDecl;
//     }

//     type GroupDecl = string[];
//     type AsyncDecl = (...args: any[]) => boolean | Promise<boolean>;
//     type NestedDecl = RuleDecl;
//     type DynamicDecl = () => RuleDecl;
//     interface RuleDecl {
//         [rule: string]: GroupDecl | AsyncDecl | NestedDecl;
//     }

//     interface ComponentOptions<V extends typeof Vue.prototype> {
//         validations?: RuleDecl | DynamicDecl;
//     }
// }
