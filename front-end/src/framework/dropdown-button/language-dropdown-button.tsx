import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import DropdownButton, { DropdownButtonArgs } from "./dropdown-button";
import { ButtonLayout, ButtonSize } from "../button/button-layout";
import DropdownButtonItem from "./dropdown-button-item";

interface LanguageDropdownButtonArgs extends DropdownButtonArgs {
    selected: (v: LanguageUtils.LanguageListItem) => void;
}

@Component
class LanguageDropdownButton extends TsxComponent<LanguageDropdownButtonArgs> implements LanguageDropdownButtonArgs {
    @Prop() cssClass!: string;
    @Prop() layout!: ButtonLayout;
    @Prop() text!: string;
    @Prop() tooltip!: string;
    @Prop() size!: ButtonSize;
    @Prop() round!: boolean;
    @Prop() outlined!: boolean;
    @Prop() dismissModal!: boolean;
    @Prop() icon!: string;
    @Prop() iconButton!: boolean;
    @Prop() iconOnRight!: boolean;
    @Prop() disabled!: boolean;
    @Prop() fullWidth!: boolean;
    @Prop() menuOnRight!: boolean;
    @Prop() selected!: (v: LanguageUtils.LanguageListItem) => void;

    raiseClickEvent(lang: LanguageUtils.LanguageListItem) {
        if (this.selected != null) {
            this.selected(lang);
        }
    }

    render(h) {
        return (
            <DropdownButton layout={this.layout} size={this.size || ButtonSize.Small} text={this.text}>
                {LanguageUtils.getLanguageList().map((lang) => (
                    <DropdownButtonItem
                        clicked={() => {
                            this.raiseClickEvent(lang);
                        }}
                        img={{ class: "flag", src: LanguageUtils.getLanguageFlagUrl(lang.flag, false), text: lang.text }}
                        text={""}
                    />
                ))}
            </DropdownButton>
        );
    }
}

export default toNative(LanguageDropdownButton);
