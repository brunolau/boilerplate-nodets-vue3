import { Prop, toNative } from "vue-facing-decorator";
import { STATUS } from "../../api/data-contracts/enums";
import TsxComponent, { Component } from "../../app/vuetsx";
import StatusTranslator from "../../utils/enum-translation/status-translator";

interface StatusDisplayerArgs {
    value: STATUS;
    mandatory?: boolean;
    label?: string;
    validationState?: ValidationState;
    wrap?: boolean;
}

@Component
class StatusDisplayer extends TsxComponent<StatusDisplayerArgs> implements StatusDisplayerArgs {
    @Prop() value: STATUS;
    @Prop() mandatory!: boolean;
    @Prop() label!: string;
    @Prop() wrap!: boolean;

    getBadgeClass(): string {
        switch (this.value) {
            case STATUS.CLOSED:
                return "badge-light-danger";
            case STATUS.OPEN:
                return "badge-light-success";
            case STATUS.LIMITED:
                return "badge-light-warning";
            default:
                return "";
        }
    }

    render(h) {
        return <span class={"badge " + this.getBadgeClass()}>{StatusTranslator.getString(this.value)}</span>;
    }
}

export default toNative(StatusDisplayer);
