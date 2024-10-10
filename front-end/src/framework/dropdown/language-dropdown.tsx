import { toNative, Prop, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { FormItemWrapperArgs, MarginType } from "../form/form-item-wrapper";
import DropdownList from ".";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";

interface LanguageDropdownArgs extends FormItemWrapperArgs {
    value?: LanguageUtils.LanguageListItem;
    placeholder?: string;
    changed?: (newValue: LanguageUtils.LanguageListItem) => void;
}

function getFlaggedResult(item): string | JQuery {
    if (item.dataRow != null) {
        return $('<span><img class="flag" src="' + LanguageUtils.getLanguageFlagUrl(item.dataRow.flag, false) + '"/>&nbsp;&nbsp;' + item.dataRow.text + "</span>");
    }

    if (item.text != null) {
        return item.text;
    }

    return "";
}

@Component
class LanguageDropdown extends TsxComponent<LanguageDropdownArgs> implements LanguageDropdownArgs {
    @Prop() label!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() value!: LanguageUtils.LanguageListItem;
    @Prop() marginType?: MarginType;
    @Prop() placeholder!: string;
    @Prop() mandatory!: boolean;
    @Prop() wrap!: boolean;
    @Prop() hint: string;
    @Prop() subtitle!: string;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    @Prop() changed: (newValue: LanguageUtils.LanguageListItem) => void;

    currentValue: LanguageUtils.LanguageListItem;

    mounted() {
        this.currentValue = this.value;
    }

    @Watch("value")
    updateValue() {
        this.currentValue = this.value;
    }

    raiseChangeEvent(e) {
        this.populateValidationDeclaration();

        if (this.changed != null) {
            this.currentValue = e;
            this.changed(e);
        }
    }

    render(h) {
        return (
            <DropdownList
                options={LanguageUtils.getLanguageList()}
                displayMember="text"
                valueMember="id"
                formatResult={(e) => {
                    return getFlaggedResult(e);
                }}
                formatSelection={(e) => {
                    return getFlaggedResult(e);
                }}
                wrap={this.wrap}
                mandatory={this.mandatory}
                label={this.label}
                labelButtons={this.labelButtons}
                subtitle={this.subtitle}
                selected={this.currentValue}
                hint={this.hint}
                appendIcon={this.appendIcon}
                prependIcon={this.prependIcon}
                marginType={this.marginType}
                appendClicked={this.appendClicked}
                prependClicked={this.prependClicked}
                changed={(e) => this.raiseChangeEvent(e)}
            />
        );
    }
}

export default toNative(LanguageDropdown);
