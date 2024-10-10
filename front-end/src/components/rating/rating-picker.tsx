import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import DropdownList, { DropdownListOption } from "../../framework/dropdown";
import "./css/rating.css";

interface RatingPickerArgs {
    selected: number;
    mandatory?: boolean;
    label?: string;
    placeholder?: string;
    validationState?: ValidationState;
    wrap?: boolean;
    changed: (e: number) => void;
}

function getFlaggedResult(state): string | JQuery {
    if (!state) return "";
    if (!state.id) return state.text;

    if (portalUtils.isNumber(state.id)) {
        const numVal = Number(state.id);
        let builder = '<span class="rating-wrapper">';

        for (let i = 0; i < numVal; i++) {
            builder += '<i class="rating-item rating-star fas fa-star"></i>';
        }

        builder += "</span>";
        return $(builder);
    }

    return state.text;
}

@Component
class RatingPicker extends TsxComponent<RatingPickerArgs> implements RatingPickerArgs {
    @Prop() selected: number;
    @Prop() mandatory!: boolean;
    @Prop() label!: string;
    @Prop() placeholder!: string;
    @Prop() wrap!: boolean;
    @Prop() changed: (e: number) => void;

    getOptionList(): DropdownListOption[] {
        return [
            { id: 1, text: "1" },
            { id: 2, text: "2" },
            { id: 3, text: "3" },
            { id: 4, text: "4" },
            { id: 5, text: "5" },
        ];
    }

    render(h) {
        let optArr = this.getOptionList();

        return (
            <DropdownList
                label={!isNullOrEmpty(this.label) ? this.label : AppState.resources.rating}
                wrap={this.wrap}
                validationState={this.validationState}
                options={optArr}
                mandatory={this.mandatory}
                formatResult={(e) => {
                    return getFlaggedResult(e);
                }}
                formatSelection={(e) => {
                    return getFlaggedResult(e);
                }}
                placeholder={!isNullOrEmpty(this.placeholder) ? this.placeholder : AppState.resources.rating}
                selected={this.selected == null ? null : optArr.find((p) => p.id == this.selected)}
                changed={(e: DropdownListOption) => {
                    this.changed((e?.id as number) || 1);
                }}
            />
        );
    }
}

export default toNative(RatingPicker);
