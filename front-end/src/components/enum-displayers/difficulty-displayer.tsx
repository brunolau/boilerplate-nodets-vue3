import { Prop, toNative } from "vue-facing-decorator";
import { DIFFICULTY } from "../../api/data-contracts/enums";
import TsxComponent, { Component } from "../../app/vuetsx";
import DifficultyTranslator from "../../utils/enum-translation/difficulty-translator";

interface DifficultyDisplayerArgs {
    value: DIFFICULTY;
    mandatory?: boolean;
    label?: string;
    validationState?: ValidationState;
    wrap?: boolean;
}

@Component
class DifficultyDisplayer extends TsxComponent<DifficultyDisplayerArgs> implements DifficultyDisplayerArgs {
    @Prop() value: DIFFICULTY;
    @Prop() mandatory!: boolean;
    @Prop() label!: string;
    @Prop() wrap!: boolean;

    getBadgeClass(): string {
        switch (this.value) {
            case DIFFICULTY.HARD:
                return "badge-light-hard";
            case DIFFICULTY.EASY:
                return "badge-light-easy";
            case DIFFICULTY.MEDIUM:
                return "badge-light-medium";
            default:
                return "";
        }
    }

    render(h) {
        return <span class={"badge " + this.getBadgeClass()}>{DifficultyTranslator.getString(this.value)}</span>;
    }
}

export default toNative(DifficultyDisplayer);
