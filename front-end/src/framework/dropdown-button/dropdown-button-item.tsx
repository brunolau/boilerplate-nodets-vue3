import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { _ButtonArgsBase, ButtonLayout, ButtonSize } from "../button/button-layout";
export interface DropdownButtonItemArgs {
    icon?: string;
    img?: ImageObj;
    text: string;
    href?: string;
    disabled?: boolean;
    hrefBlank?: boolean;
    clicked?: () => void;
    isSelected?: boolean;
    emptySpace?: boolean;
}

export interface ImageObj {
    class?: string;
    src: string;
    text?: string;
}

@Component
class DropdownButtonItem extends TsxComponent<DropdownButtonItemArgs> implements DropdownButtonItemArgs {
    @Prop() icon!: string;
    @Prop() img!: ImageObj;
    @Prop() text!: string;
    @Prop() href!: string;
    @Prop() disabled!: boolean;
    @Prop() hrefBlank!: boolean;
    @Prop() isSelected!: boolean;
    @Prop() clicked?: () => void;
    @Prop() emptySpace!: boolean;

    raiseClickEvent() {
        if (this.disabled == true) {
            return;
        }

        if (this.clicked != null) {
            this.clicked();
        }
    }

    getHref(): string {
        if (!isNullOrEmpty(this.href) && this.disabled != true) {
            return this.href;
        } else {
            return "javascript:";
        }
    }

    getHrefTarget(): string {
        if (this.hrefBlank == true && this.disabled != true) {
            return "_blank";
        }

        return null;
    }

    //<a href="javascript:" class="dropdown-item dropdown-selectable-section"><span>Tabulka</span><i class="fas fa-check"></i></a>

    render(h) {
        return (
            <a
                class={"dropdown-item" + (this.isSelected ? " dropdown-selectable-section" : "") + (this.disabled == true ? " disabled " : "")}
                href={this.getHref()}
                target={this.getHrefTarget()}
                onClick={() => this.raiseClickEvent()}
            >
                {!isNullOrEmpty(this.icon) && (
                    <span class="dd-btn-icon">
                        <span class="dd-btn-icon-wrap">
                            <i class={this.icon}></i>
                        </span>
                        {this.emptySpace != false && <span>&nbsp;&nbsp;</span>}
                    </span>
                )}
                {this.img != null && (
                    <span>
                        <img class={this.img.class} src={this.img.src} />
                        {this.emptySpace != false && <span>&nbsp;&nbsp;</span>}
                        {this.img.text}
                    </span>
                )}

                <span>{this.text}</span>

                {this.isSelected && <i class="fas fa-check"></i>}
            </a>
        );
    }
}

export default toNative(DropdownButtonItem);
