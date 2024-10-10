import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import ActiveTranslator from "../../utils/enum-translation/active-translator";

interface ActiveDisplayerArgs {
    value: boolean;
    mandatory?: boolean;
    label?: string;
    validationState?: ValidationState;
    wrap?: boolean;
}

@Component
class ActiveDisplayer extends TsxComponent<ActiveDisplayerArgs> implements ActiveDisplayerArgs {
    @Prop() value: boolean;
    @Prop() mandatory!: boolean;
    @Prop() label!: string;
    @Prop() wrap!: boolean;

    getBadgeClass(): string {
        if (this.value) {
            return "badge-light-success";
        } else {
            return "badge-light-danger";
        }
    }

    render(h) {
        return <span class={"badge " + this.getBadgeClass()}>{ActiveTranslator.getString(this.value)}</span>;
    }
}

export default toNative(ActiveDisplayer);
