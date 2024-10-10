import { Prop, Vue } from "vue-facing-decorator";
import { Component as OriginalComponent, ComponentConsOption, RuleDecl, DynamicDecl } from "vue-facing-decorator";

@Component
export default class TsxComponent<P> extends Vue {
    private vueTsxProps: Readonly<{ ref?: string; key?: string | number }> & Readonly<P>;
    model: never;

    @Prop() validationState!: ValidationState;

    protected get hasValidationError(): boolean {
        return this.validationState != null && this.validationState.valid == false;
    }

    protected get validationCssClass(): string {
        return this.hasValidationError ? "has-danger" : "";
    }

    protected get validationErrorMessage(): string {
        return this.hasValidationError ? this.validationState.errorMessage : null;
    }

    protected populateValidationDeclaration(): void {
        if (this.validationState != null) {
            this.validationState.validationDeclaration["_changed"] = true;
            this.validationState.validationDeclaration["_label"] = this["label"];
        }
    }

    protected getSlotProperties<T>(type: string): Array<T> {
        var retVal: Array<T> = [];
        //FIXME: find vue3 component options or if this is needed
        (this.$slots.default?.() || [])?.[0]?.children?.forEach?.((node) => {
            if (node.type && (node.type.name || "").endsWith(type)) {
                retVal.push(node.props as any);
            }
            // if (
            //   node.type &&
            //   (node.type.name || '').endsWith(type)
            // ) {
            //   retVal.push(node.props as any)
            // }
            // node.children?.forEach((child) => {
            //   if (child.type && (child.type.name || '').endsWith(type)) {
            //     retVal.push(child.props as any)
            //   }
            // })
        });

        return retVal;
    }
}

@Component
export class TsxComponentLite<P> extends Vue {
    model: never;
    private vueTsxProps: Readonly<{ ref?: string }> & Readonly<P>;
}

type ComponentOptions = {
    validations?: RuleDecl | DynamicDecl;
} & ComponentConsOption;

export function Component(options: ComponentOptions, ctx?: ClassDecoratorContext) {
    return OriginalComponent(options as any, ctx);
}

declare global {
    namespace JSX {
        interface ElementAttributesProperty {
            vueTsxProps: {};
        }
    }

    interface PublicMethodSet<T> {
        methods: T;
    }
}
