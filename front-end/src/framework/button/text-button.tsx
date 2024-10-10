import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";

interface TextButtonArgs {
    clicked: (e: any) => void;
    text: string;
    icon: string;
    tooltip?: string;
    cssClass?: string;
    pulsate?: boolean;
    fontAdjust?: boolean;
}

@Component
class TextButton extends TsxComponent<TextButtonArgs> implements TextButtonArgs {
    @Prop() cssClass!: string;
    @Prop() icon!: string;
    @Prop() text!: string;
    @Prop() tooltip!: string;
    @Prop() fontAdjust!: boolean;

    @Prop() clicked: (e: any) => void;
    @Prop() disabled!: boolean;
    @Prop() fullWidth!: boolean;
    @Prop() pulsate!: boolean;

    getCssClass(): string {
        return "text-button" + (this.cssClass != null ? " " + this.cssClass : "") + (this.pulsate ? " btn-pulsating" : "") + (this.fontAdjust == true ? " text-button-font" : "");
    }

    onButtonClicked(e) {
        this.clicked(e);

        if (!isNullOrEmpty(this.tooltip)) {
            $("body > .tooltip").first().remove();
        }
    }

    mounted() {
        if (!isNullOrEmpty(this.tooltip)) {
            $(this.$el).tooltip();
        }
    }

    render(h) {
        return (
            <span
                onClick={(e) => {
                    this.onButtonClicked(e);
                }}
                class={this.getCssClass()}
                title={this.tooltip}
            >
                <i class={this.icon}></i>
                <span>{this.text}</span>
            </span>
        );
    }
}

export default toNative(TextButton);
