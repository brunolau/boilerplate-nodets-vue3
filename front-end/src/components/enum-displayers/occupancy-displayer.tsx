import { Prop, toNative } from "vue-facing-decorator";
import { OCCUPANCY } from "../../api/data-contracts/enums";
import TsxComponent, { Component } from "../../app/vuetsx";
import OccupancyTranslator from "../../utils/enum-translation/occupancy-translator";

interface OccupancyDisplayerArgs {
    value: OCCUPANCY;
    mandatory?: boolean;
    label?: string;
    validationState?: ValidationState;
    wrap?: boolean;
}

@Component
class OccupancyDisplayer extends TsxComponent<OccupancyDisplayerArgs> implements OccupancyDisplayerArgs {
    @Prop() value: OCCUPANCY;
    @Prop() mandatory!: boolean;
    @Prop() label!: string;
    @Prop() wrap!: boolean;

    getBadgeClass(): string {
        switch (this.value) {
            case OCCUPANCY.HIGH:
                return "badge-medium";
            case OCCUPANCY.LOW:
                return "badge-success";
            case OCCUPANCY.MEDIUM:
                return "badge-warning";
            default:
                return "";
        }
    }

    render(h) {
        return <span class={"badge " + this.getBadgeClass()}>{OccupancyTranslator.getString(this.value)}</span>;
    }
}

export default toNative(OccupancyDisplayer);
